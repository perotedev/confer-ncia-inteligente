import { redis } from "../config/redis";
import { CheckflowEvent, CheckflowEventType, REDIS_EVENTS_CHANNEL } from "../types";

/**
 * EventService — desacopla os serviços de negócio do Socket.IO.
 * Publica eventos no canal Redis; o handler do Socket.IO assina
 * esse canal e faz broadcast para os clientes conectados.
 * Com isso, múltiplas instâncias da aplicação recebem os eventos
 * via Redis Pub/Sub e repassam para seus próprios clientes.
 */
class EventService {
  async publish<T>(type: CheckflowEventType, payload: T): Promise<void> {
    const event: CheckflowEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    await redis.publish(REDIS_EVENTS_CHANNEL, JSON.stringify(event));
  }
}

export const eventService = new EventService();
