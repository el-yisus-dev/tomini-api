import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ error: "El email debe ser válido" }),

  password: z
    .string()
    .min(1, { error: "La contraseña es requerida" })
});