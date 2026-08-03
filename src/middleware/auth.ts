import type { Request, Response, NextFunction } from "express";
import { type JwtPayload } from "jsonwebtoken";

import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "No autorizado"
      });

      return;
    }

    const token = authorization.split(" ")[1];

    const decoded = verifyToken(token) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        status: "error",
        message: "Usuario no encontrado"
      });

      return;
    }

    res.locals.user = user;

    next();
  } catch {
    res.status(401).json({
      status: "error",
      message: "Token inválido o expirado"
    });
  }
};