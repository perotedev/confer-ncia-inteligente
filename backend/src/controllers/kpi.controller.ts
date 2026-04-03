import { Request, Response, NextFunction } from "express";
import { kpiService } from "../services/kpi.service";

export const kpiController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await kpiService.getKpis();
      res.json({ data: kpis });
    } catch (err) {
      next(err);
    }
  },
};
