import jwt from "jsonwebtoken";
import config from "../config/config.js";

interface JwtPayload {
  id: string;
  role: string;
}

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(
    payload,
    config.jwtSecret!,
    {
      expiresIn: config.jwtExpires!
    }
  );
};

export const verifyToken = (token: string) =>
  jwt.verify(token, config.jwtSecret!);