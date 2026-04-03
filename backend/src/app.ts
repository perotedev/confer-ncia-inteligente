import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import bancadaRoutes from "./routes/bancada.routes";
import materialRoutes from "./routes/material.routes";
import kpiRoutes from "./routes/kpi.routes";
import relatorioRoutes from "./routes/relatorio.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");
app.use(cors({ origin: corsOrigins, credentials: true }));

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/bancadas", bancadaRoutes);
app.use("/api/materiais", materialRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/relatorios", relatorioRoutes);

// ── Error handler (deve ser o último middleware) ───────────────
app.use(errorHandler);

export default app;
