import { Request, Response, NextFunction } from "express";
import { MaterialStatus } from "@prisma/client";
import { prisma } from "../config/database";

export const relatorioController = {
  async divergencias(_req: Request, res: Response, next: NextFunction) {
    try {
      const materiais = await prisma.material.findMany({
        where: { status: MaterialStatus.DIVERGENTE },
        include: { bancada: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      });

      const porBancada = materiais.reduce<Record<string, { bancadaNome: string; total: number; sobras: number; faltas: number }>>(
        (acc, m) => {
          const key = m.bancadaId;
          if (!acc[key]) {
            acc[key] = { bancadaNome: m.bancada.name, total: 0, sobras: 0, faltas: 0 };
          }
          acc[key].total++;
          if (m.divergenceType === "SOBRA") acc[key].sobras++;
          if (m.divergenceType === "FALTA") acc[key].faltas++;
          return acc;
        },
        {},
      );

      res.json({
        data: {
          total: materiais.length,
          materiais,
          porBancada: Object.values(porBancada),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async produtividade(_req: Request, res: Response, next: NextFunction) {
    try {
      const bancadas = await prisma.bancada.findMany({
        include: {
          operator: { select: { id: true, name: true } },
          _count: { select: { materials: true } },
        },
        orderBy: { itemsConferidos: "desc" },
      });

      const relatorio = bancadas.map((b) => ({
        id: b.id,
        nome: b.name,
        operador: b.operator?.name ?? "Sem operador",
        status: b.status,
        itemsConferidos: b.itemsConferidos,
        itemsTotal: b.itemsTotal,
        divergencias: b.divergencias,
        progresso: b.itemsTotal > 0 ? Math.round((b.itemsConferidos / b.itemsTotal) * 100) : 0,
        taxaDivergencia: b.itemsConferidos > 0
          ? parseFloat(((b.divergencias / b.itemsConferidos) * 100).toFixed(1))
          : 0,
        ultimaAtividade: b.lastActivity,
      }));

      res.json({ data: relatorio });
    } catch (err) {
      next(err);
    }
  },

  async atividades(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const bancadaId = req.query.bancadaId as string | undefined;

      const events = await prisma.activityEvent.findMany({
        where: bancadaId ? { bancadaId } : undefined,
        include: { bancada: { select: { id: true, name: true } } },
        orderBy: { timestamp: "desc" },
        take: limit,
      });

      res.json({ data: events });
    } catch (err) {
      next(err);
    }
  },
};
