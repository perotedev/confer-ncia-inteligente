import { BancadaActivity, BancadaStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { eventService } from "./event.service";

export const bancadaService = {
  async findAll() {
    return prisma.bancada.findMany({
      include: { operator: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    const bancada = await prisma.bancada.findUnique({
      where: { id },
      include: {
        operator: { select: { id: true, name: true, email: true, role: true } },
        materials: { orderBy: { createdAt: "desc" } },
        events: { orderBy: { timestamp: "desc" }, take: 20 },
      },
    });
    if (!bancada) throw new AppError(404, "Bancada não encontrada");
    return bancada;
  },

  async create(name: string, operatorId?: string) {
    return prisma.bancada.create({
      data: { name, operatorId },
      include: { operator: { select: { id: true, name: true, email: true, role: true } } },
    });
  },

  async update(id: string, data: Partial<{ name: string; operatorId: string; status: BancadaStatus; activity: BancadaActivity }>) {
    const bancada = await prisma.bancada.findUnique({ where: { id } });
    if (!bancada) throw new AppError(404, "Bancada não encontrada");

    const updated = await prisma.bancada.update({
      where: { id },
      data: { ...data, lastActivity: new Date() },
      include: { operator: { select: { id: true, name: true, email: true, role: true } } },
    });

    await eventService.publish("bancada:updated", updated);
    return updated;
  },

  async remove(id: string) {
    const bancada = await prisma.bancada.findUnique({ where: { id } });
    if (!bancada) throw new AppError(404, "Bancada não encontrada");
    await prisma.bancada.delete({ where: { id } });
  },

  async getActivities(bancadaId: string, limit = 50) {
    const bancada = await prisma.bancada.findUnique({ where: { id: bancadaId } });
    if (!bancada) throw new AppError(404, "Bancada não encontrada");

    return prisma.activityEvent.findMany({
      where: { bancadaId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  },
};
