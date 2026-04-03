import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { JwtPayload } from "../types";

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  } as jwt.SignOptions);
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new AppError(401, "E-mail ou senha inválidos");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "E-mail ou senha inválidos");

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  async register(name: string, email: string, password: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw new AppError(409, "Este e-mail já está cadastrado");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashed, role },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const { password: _, ...userData } = user;
    return { token, user: userData };
  },

  async resetPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Não revela se o e-mail existe ou não (segurança)
    if (!user) return;
    // Em produção: enviar e-mail com link de reset
    console.log(`[auth] Reset de senha solicitado para ${email}`);
  },
};
