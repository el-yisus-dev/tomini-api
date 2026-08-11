import { z } from "zod";

import { CashMovementType } from "../types/CashRegister.js";

export const createCashMovementSchema = z.object({
    type: z.enum(
        [
            CashMovementType.DEPOSIT,
            CashMovementType.WITHDRAWAL
        ],
        {
            message:
                "El tipo de movimiento debe ser DEPOSIT o WITHDRAWAL"
        }
    ),

    amount: z
        .number({
            message: "El monto debe ser un número"
        })
        .positive(
            "El monto debe ser mayor a 0"
        ),

    reason: z
        .string()
        .trim()
        .min(
            1,
            "El motivo es obligatorio"
        )
        .max(
            500,
            "El motivo no puede superar los 500 caracteres"
        )
});