import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redisPubAdapter, redisSubAdapter, redisSub } from "../config/redis";
import { CheckflowEvent, REDIS_EVENTS_CHANNEL } from "../types";
import { socketAuthMiddleware, registerSocketHandlers } from "./handlers";

let io: Server;

export function initSocketIO(httpServer: HttpServer): Server {
  const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Permite tanto WebSocket quanto long-polling (fallback)
    transports: ["websocket", "polling"],
  });

  // ── Redis Adapter ─────────────────────────────────────────────
  // Garante que io.emit() e io.to(room).emit() funcionem em
  // múltiplas instâncias: o adapter sincroniza via Redis Pub/Sub.
  io.adapter(createAdapter(redisPubAdapter, redisSubAdapter));

  // ── Auth middleware ───────────────────────────────────────────
  io.use(socketAuthMiddleware);

  // ── Conexão ───────────────────────────────────────────────────
  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
  });

  // ── Assinatura do canal Redis (EventService → Socket.IO) ──────
  // Cada instância da app assina o canal e repassa eventos aos
  // seus clientes conectados. O Redis Adapter cuida do broadcast
  // entre instâncias para salas; este subscriber lida com a camada
  // de negócio (ex: determinar para qual sala enviar).
  redisSub.subscribe(REDIS_EVENTS_CHANNEL, (err) => {
    if (err) console.error("[redis-sub] Erro ao assinar canal:", err);
    else console.log(`[redis-sub] Assinando canal ${REDIS_EVENTS_CHANNEL}`);
  });

  redisSub.on("message", (_channel: string, message: string) => {
    try {
      const event = JSON.parse(message) as CheckflowEvent;
      broadcastEvent(event);
    } catch (err) {
      console.error("[redis-sub] Erro ao parsear evento:", err);
    }
  });

  return io;
}

/**
 * Roteia o evento para a(s) sala(s) correta(s) no Socket.IO.
 * "global" recebe todos os eventos; salas de bancada recebem
 * apenas eventos relacionados à sua bancada.
 */
function broadcastEvent(event: CheckflowEvent): void {
  // Broadcast global (dashboard)
  io.to("global").emit(event.type, event);

  // Broadcast para sala de bancada específica (quando aplicável)
  const payload = event.payload as Record<string, unknown>;
  const bancadaId =
    (payload.bancadaId as string | undefined) ??
    (payload.id as string | undefined);

  if (bancadaId) {
    io.to(`bancada:${bancadaId}`).emit(event.type, event);
  }
}

export { io };
