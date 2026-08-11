import { z } from "zod";

export const openCashRegisterSchema = z.object({
    openingAmount: z
        .number({
            message: "El monto de apertura debe ser un número"
        })
        .min(
            0,
            "El monto de apertura no puede ser negativo"
        )
});

export const closeCashRegisterSchema = z.object({
    closingAmount: z
        .number({
            message: "El monto de cierre debe ser un número"
        })
        .min(
            0,
            "El monto de cierre no puede ser negativo"
        )
});