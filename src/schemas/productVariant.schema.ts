import { z } from "zod";
import { objectIdSchema } from "./id.schema.js";
import { ProductUnit } from "../types/ProductVariant.js";

export const createProductVariantSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "El nombre de la variante es obligatorio")
        .max(100, "El nombre de la variante no puede superar los 100 caracteres"),

    sku: z
        .string()
        .trim()
        .min(1, "El SKU es obligatorio")
        .max(50, "El SKU no puede superar los 50 caracteres"),

    barcode: z
        .string()
        .trim()
        .max(50, "El código de barras no puede superar los 50 caracteres")
        .optional(),

    purchasePrice: z
        .number()
        .min(0, "El precio de compra no puede ser negativo"),

    salePrice: z
        .number()
        .min(0, "El precio de venta no puede ser negativo"),

    minStock: z
        .number()
        .min(0, "El stock mínimo no puede ser negativo"),

    unit: z
        .enum(ProductUnit),

    quantity: z
        .number()
        .positive("La cantidad debe ser mayor a 0"),

    isActive: z
        .boolean()
        .optional()
});

export const updateProductVariantSchema = createProductVariantSchema
    .partial();