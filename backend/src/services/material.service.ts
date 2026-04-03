import { DivergenceType, MaterialStatus, ActivityType } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { eventService } from "./event.service";

export const materialService = {
  async findAll(filters?: { bancadaId?: string; status?: MaterialStatus }) {
    return prisma.material.findMany({
      where: filters,
      include: { bancada: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: { bancada: { select: { id: true, name: true } } },
    });
    if (!material) throw new AppError(404, "Material não encontrado");
    return material;
  },

  async create(data: {
    code: string;
    name: string;
    expectedQty: number;
    unit: string;
    lot: string;
    expiry: Date;
    bancadaId: string;
  }) {
    const bancada = await prisma.bancada.findUnique({ where: { id: data.bancadaId } });
    if (!bancada) throw new AppError(404, "Bancada não encontrada");

    const material = await prisma.material.create({
      data: { ...data, checkedQty: 0, status: MaterialStatus.PENDENTE },
      include: { bancada: { select: { id: true, name: true } } },
    });

    // Incrementa total da bancada
    await prisma.bancada.update({
      where: { id: data.bancadaId },
      data: { itemsTotal: { increment: 1 }, lastActivity: new Date() },
    });

    await eventService.publish("material:updated", material);
    return material;
  },

  async conferir(id: string, checkedQty: number, operator: string) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: { bancada: true },
    });
    if (!material) throw new AppError(404, "Material não encontrado");

    const hasDivergence = checkedQty !== material.expectedQty;
    const divergenceType: DivergenceType | null = hasDivergence
      ? checkedQty > material.expectedQty
        ? DivergenceType.SOBRA
        : DivergenceType.FALTA
      : null;

    const newStatus = hasDivergence ? MaterialStatus.DIVERGENTE : MaterialStatus.CONFERIDO;

    const [updatedMaterial] = await prisma.$transaction([
      prisma.material.update({
        where: { id },
        data: { checkedQty, status: newStatus, divergenceType },
        include: { bancada: { select: { id: true, name: true } } },
      }),
      // Atualiza contadores da bancada
      prisma.bancada.update({
        where: { id: material.bancadaId },
        data: {
          itemsConferidos: { increment: material.status === MaterialStatus.PENDENTE ? 1 : 0 },
          divergencias: hasDivergence
            ? { increment: material.status !== MaterialStatus.DIVERGENTE ? 1 : 0 }
            : { decrement: material.status === MaterialStatus.DIVERGENTE ? 1 : 0 },
          status: hasDivergence ? "DIVERGENCIA" : "CONFERINDO",
          lastActivity: new Date(),
        },
      }),
      // Registra evento de atividade
      prisma.activityEvent.create({
        data: {
          bancadaId: material.bancadaId,
          operator,
          type: hasDivergence ? ActivityType.DIVERGENCIA : ActivityType.CONFERENCIA,
          message: hasDivergence
            ? `Divergência: ${material.code} — ${divergenceType === DivergenceType.FALTA ? "falta" : "sobra"} de ${Math.abs(checkedQty - material.expectedQty)} ${material.unit}`
            : `Conferiu ${material.code} — ${checkedQty}/${material.expectedQty} ${material.unit} ✓`,
        },
      }),
    ]);

    const activityEvent = await prisma.activityEvent.findFirst({
      where: { bancadaId: material.bancadaId },
      orderBy: { createdAt: "desc" },
    });

    await Promise.all([
      eventService.publish("material:updated", updatedMaterial),
      activityEvent && eventService.publish("activity:new", activityEvent),
    ]);

    return updatedMaterial;
  },

  async remove(id: string) {
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) throw new AppError(404, "Material não encontrado");
    await prisma.material.delete({ where: { id } });
    await prisma.bancada.update({
      where: { id: material.bancadaId },
      data: { itemsTotal: { decrement: 1 } },
    });
  },
};
