import { BancadaStatus, MaterialStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { eventService } from "./event.service";

export const kpiService = {
  async getKpis() {
    const [bancadas, materials] = await Promise.all([
      prisma.bancada.findMany(),
      prisma.material.findMany(),
    ]);

    const totalBancadas = bancadas.length;
    const bancadasAtivas = bancadas.filter((b) => b.status !== BancadaStatus.INATIVA).length;
    const totalItens = materials.length;
    const itensConferidos = materials.filter(
      (m) => m.status === MaterialStatus.CONFERIDO || m.status === MaterialStatus.DIVERGENTE,
    ).length;
    const itensDivergentes = materials.filter((m) => m.status === MaterialStatus.DIVERGENTE).length;
    const taxaDivergencia =
      itensConferidos > 0 ? parseFloat(((itensDivergentes / itensConferidos) * 100).toFixed(1)) : 0;

    const divergenciasPendentes = bancadas.reduce((acc, b) => acc + b.divergencias, 0);

    // Tempo médio baseado em bancadas ativas (mock simplificado)
    const tempoMedioConferencia = "2m 14s";
    const produtividadeMedia =
      bancadasAtivas > 0
        ? parseFloat((itensConferidos / Math.max(bancadasAtivas, 1)).toFixed(1))
        : 0;

    return {
      totalBancadas,
      bancadasAtivas,
      totalItens,
      itensConferidos,
      taxaDivergencia,
      tempoMedioConferencia,
      produtividadeMedia,
      divergenciasPendentes,
    };
  },

  async broadcastKpis() {
    const kpis = await kpiService.getKpis();
    await eventService.publish("kpis:updated", kpis);
    return kpis;
  },
};
