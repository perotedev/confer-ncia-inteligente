import { Router } from "express";
import { materialController } from "../controllers/material.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", materialController.list);
router.get("/:id", materialController.get);

router.post("/", authorize("SUPERVISOR", "ADMIN"), materialController.create);
router.post("/:id/conferir", materialController.conferir); // Operador pode conferir
router.delete("/:id", authorize("ADMIN"), materialController.remove);

export default router;
