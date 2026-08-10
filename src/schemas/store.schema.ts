import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional(),

  address: z
    .string()
    .trim()
    .max(300, "La dirección no puede superar los 300 caracteres")
    .optional(),
});

export const updateStoreSchema = createStoreSchema.partial();
