import { Role } from "@prisma/client";

// ── JWT Payload ───────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

// ── Express augmentation ──────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ── Socket.IO Events ──────────────────────────────────────────
export type CheckflowEventType =
  | "bancada:updated"
  | "material:updated"
  | "activity:new"
  | "kpis:updated";

export interface CheckflowEvent<T = unknown> {
  type: CheckflowEventType;
  payload: T;
  timestamp: string;
}

// ── Redis Pub/Sub ─────────────────────────────────────────────
export const REDIS_EVENTS_CHANNEL = "checkflow:events";

// ── API Response ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
