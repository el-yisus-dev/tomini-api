import { z } from "zod";


export const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres"),

    description: z
        .string()
        .trim()
        .max(
            500,
            "La descripción no puede superar los 500 caracteres"
        )
        .optional(),

    store: z
        .string()
        .trim()
        .min(1, "La tienda es requerida"),

});


export const updateCategorySchema = createCategorySchema.partial();