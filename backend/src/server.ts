import "dotenv/config";
import http from "http";
import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { connectRedis, redis, redisSub, redisPubAdapter, redisSubAdapter } from "./config/redis";
import { initSocketIO } from "./socket";
import { kpiService } from "./services/kpi.service";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

async function bootstrap() {
  // ── Conecta às dependências externas ─────────────────────────
  await connectDatabase();
  await connectRedis();

  // ── Cria servidor HTTP + Socket.IO ────────────────────────────
  const httpServer = http.createServer(app);
  initSocketIO(httpServer);

  // ── Broadcast periódico de KPIs (a cada 30s) ─────────────────
  const kpiInterval = setInterval(() => {
    kpiService.broadcastKpis().catch(console.error);
  }, 30_000);

  // ── Inicia o servidor ─────────────────────────────────────────
  httpServer.listen(PORT, () => {
    console.log(`🚀 CheckFlow backend rodando na porta ${PORT}`);
    console.log(`   REST API: http://localhost:${PORT}/api`);
    console.log(`   WebSocket: ws://localhost:${PORT}`);
    console.log(`   Health:    http://localhost:${PORT}/health`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] Encerrando servidor...`);
    clearInterval(kpiInterval);
    httpServer.close(async () => {
      await Promise.all([
        disconnectDatabase(),
        redis.quit(),
        redisSub.quit(),
        redisPubAdapter.quit(),
        redisSubAdapter.quit(),
      ]);
      console.log("✅ Servidor encerrado com sucesso");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("❌ Erro ao iniciar o servidor:", err);
  process.exit(1);
});
