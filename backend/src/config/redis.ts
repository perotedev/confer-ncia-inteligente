import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

// Instância principal — uso geral (get/set/publish)
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Instância dedicada para Subscribe (ioredis bloqueia em modo subscriber)
export const redisSub = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Instâncias para o Redis Adapter do Socket.IO
export const redisPubAdapter = new Redis(redisUrl, { lazyConnect: true });
export const redisSubAdapter = new Redis(redisUrl, { lazyConnect: true });

export async function connectRedis(): Promise<void> {
  await Promise.all([
    redis.connect(),
    redisSub.connect(),
    redisPubAdapter.connect(),
    redisSubAdapter.connect(),
  ]);
  console.log("✅ Redis conectado (4 conexões)");
}

redis.on("error", (err) => console.error("Redis error:", err));
redisSub.on("error", (err) => console.error("RedisSub error:", err));
