import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { MaterialStatus } from "@prisma/client";
import { materialService } from "../services/material.service";

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  expectedQty: z.number().positive(),
  unit: z.string().min(1),
  lot: z.string().min(1),
  expiry: z.coerce.date(),
  bancadaId: z.string().uuid(),
});

const conferirSchema = z.object({
  checkedQty: z.number().min(0),
  operator: z.string().min(1),
});

const filterSchema = z.object({
  bancadaId: z.string().uuid().optional(),
  status: z.nativeEnum(MaterialStatus).optional(),
});

export const materialController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = filterSchema.parse(req.query);
      const materials = await materialService.findAll(filters);
      res.json({ data: materials });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const material = await materialService.findById(req.params.id);
      res.json({ data: material });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSchema.parse(req.body);
      const material = await materialService.create(data);
      res.status(201).json({ data: material });
    } catch (err) {
      next(err);
    }
  },

  async conferir(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkedQty, operator } = conferirSchema.parse(req.body);
      const material = await materialService.conferir(req.params.id, checkedQty, operator);
      res.json({ data: material });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await materialService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
