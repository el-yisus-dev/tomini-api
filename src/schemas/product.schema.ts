import { z } from "zod";
import { objectId } from "./id.schema.js";

export const createProductSchema = z.object({
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

    category: objectId,

    store: objectId,

    isActive: z
        .boolean()
        .optional()
});

export const updateProductSchema = createProductSchema
    .omit({
        store: true,
        category: true
    })
    .partial();