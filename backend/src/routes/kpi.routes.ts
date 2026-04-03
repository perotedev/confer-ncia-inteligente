import { Router } from "express";
import { kpiController } from "../controllers/kpi.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, kpiController.get);

export default router;
