import { Router } from "express";
import { bancadaController } from "../controllers/bancada.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", bancadaController.list);
router.get("/:id", bancadaController.get);
router.get("/:id/activities", bancadaController.getActivities);

router.post("/", authorize("SUPERVISOR", "ADMIN"), bancadaController.create);
router.put("/:id", authorize("SUPERVISOR", "ADMIN"), bancadaController.update);
router.delete("/:id", authorize("ADMIN"), bancadaController.remove);

export default router;
