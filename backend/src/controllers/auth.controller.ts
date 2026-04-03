import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { authService } from "../services/auth.service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional().default(Role.OPERATOR),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = registerSchema.parse(req.body);
      const result = await authService.register(name, email, password, role);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotSchema.parse(req.body);
      await authService.resetPassword(email);
      res.json({ message: "Se o e-mail existir, um link de recuperação será enviado." });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response) {
    res.json({ data: req.user });
  },
};
