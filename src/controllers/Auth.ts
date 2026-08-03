import type { Request, Response } from "express";

import { User } from "../models/User.js";
import { errorHandler } from "../middleware/Error.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user === null) {
      res.status(401).json({
        status: "error",
        message: "Correo o contraseña incorrectos"
      });

      return;
    }

    if (!user.enabled) {
      res.status(403).json({
        status: "error",
        message: "La cuenta está deshabilitada"
      });

      return;
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      res.status(401).json({
        status: "error",
        message: "Correo o contraseña incorrectos"
      });

      return;
    }

    const token = generateToken({
      id: user.id,
      role: user.role
    });

    res.status(200).json({
      status: "success",
      data: {
        token,
        user
    }});
    
  } catch (error) {
    errorHandler(error, req, res);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user }= res.locals;
    
    const userData = await User.findById(user.id).select("-password");

    if (userData === null) {
      res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });

      return;
    }

    res.status(200).json({
      status: "success",
      data: {
        userData
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};