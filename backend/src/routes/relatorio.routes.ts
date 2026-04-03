import { Router } from "express";
import { relatorioController } from "../controllers/relatorio.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize("SUPERVISOR", "ADMIN"));

router.get("/divergencias", relatorioController.divergencias);
router.get("/produtividade", relatorioController.produtividade);
router.get("/atividades", relatorioController.atividades);

export default router;
