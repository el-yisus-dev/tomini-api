import { z } from "zod";

export const updateInventorySchema = z.object({
    quantity: z
        .number()
        .refine(
            value => value !== 0,
            "La cantidad del ajuste no puede ser 0"
        ),

    reason: z
        .string()
        .trim()
        .max(
            500,
            "El motivo no puede superar los 500 caracteres"
        )
        .optional()
});