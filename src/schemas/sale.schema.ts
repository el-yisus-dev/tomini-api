import { z } from "zod";

import {
    PaymentMethod
} from "../types/Sale.js";

export const createSaleSchema = z.object({

    items: z
        .array(
            z.object({
                productVariant: z
                    .string()
                    .trim()
                    .min(
                        1,
                        "La variante del producto es obligatoria"
                    ),

                quantity: z
                    .number()
                    .finite(
                        "La cantidad debe ser un número válido"
                    )
                    .positive(
                        "La cantidad debe ser mayor a 0"
                    )
            })
        )
        .min(
            1,
            "La venta debe contener al menos un producto"
        ),

    discount: z
        .number()
        .finite(
            "El descuento debe ser un número válido"
        )
        .min(
            0,
            "El descuento no puede ser negativo"
        )
        .default(0),

    paymentMethod: z.enum(
        Object.values(PaymentMethod) as [
            PaymentMethod,
            ...PaymentMethod[]
        ],
        {
            message: "El método de pago no es válido"
        }
    ),

    amountPaid: z
        .number()
        .finite(
            "El monto recibido debe ser un número válido"
        )
        .min(
            0,
            "El monto recibido no puede ser negativo"
        )
});