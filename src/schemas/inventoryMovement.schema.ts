import { z } from "zod";

const inventoryMovementTypes = [
    "PURCHASE",
    "SALE",
    "ADJUSTMENT",
    "DAMAGE",
    "RETURN"
] as const;

export const createInventoryMovementSchema = z.object({
    productVariant: z
        .string()
        .regex(/^[a-f\d]{24}$/i, "Id de variante inválido"),

    type: z
        .enum(inventoryMovementTypes, {
            message: "El tipo de movimiento no es válido"
        }),

    quantity: z
        .number()
        .refine(
            (value) => value !== 0,
            "La cantidad del movimiento no puede ser 0"
        ),

    reason: z
        .string()
        .trim()
        .max(
            500,
            "El motivo no puede superar los 500 caracteres"
        )
        .optional(),

    reference: z
        .string()
        .regex(/^[a-f\d]{24}$/i, "Id de referencia inválido")
        .optional()
});