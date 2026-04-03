import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BancadaStatus, BancadaActivity } from "@prisma/client";
import { bancadaService } from "../services/bancada.service";

const createSchema = z.object({
  name: z.string().min(1),
  operatorId: z.string().uuid().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  operatorId: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(BancadaStatus).optional(),
  activity: z.nativeEnum(BancadaActivity).optional(),
});

export const bancadaController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bancadas = await bancadaService.findAll();
      res.json({ data: bancadas });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bancada = await bancadaService.findById(req.params.id);
      res.json({ data: bancada });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, operatorId } = createSchema.parse(req.body);
      const bancada = await bancadaService.create(name, operatorId);
      res.status(201).json({ data: bancada });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSchema.parse(req.body);
      const bancada = await bancadaService.update(req.params.id, data as Parameters<typeof bancadaService.update>[1]);
      res.json({ data: bancada });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await bancadaService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const events = await bancadaService.getActivities(req.params.id, limit);
      res.json({ data: events });
    } catch (err) {
      next(err);
    }
  },
};
