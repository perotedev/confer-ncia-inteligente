import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

/**
 * Valida o token JWT no handshake do Socket.IO.
 * O cliente deve enviar: io({ auth: { token: "<jwt>" } })
 */
export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) {
    return next(new Error("Token não fornecido"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    socket.data.user = payload;
    next();
  } catch {
    next(new Error("Token inválido"));
  }
}

/**
 * Registra os event handlers de cada socket conectado.
 */
export function registerSocketHandlers(io: Server, socket: Socket): void {
  const user = socket.data.user as JwtPayload;

  console.log(`[ws] Conectado: ${user.email} (${socket.id})`);

  // ── Sala global — todos os clientes autenticados ──────────────
  void socket.join("global");

  // ── Entrar na sala de uma bancada específica ──────────────────
  socket.on("bancada:join", (bancadaId: string) => {
    void socket.join(`bancada:${bancadaId}`);
    console.log(`[ws] ${user.email} entrou em bancada:${bancadaId}`);
  });

  socket.on("bancada:leave", (bancadaId: string) => {
    void socket.leave(`bancada:${bancadaId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[ws] Desconectado: ${user.email} — ${reason}`);
  });
}
