import { z } from "zod";

// Only valid to mongoIds
export const objectId = z
    .string()
    .regex(
        /^[a-f\d]{24}$/i,
        "Id invalido"
    );

export const objectIdSchema = z.object({
    id: objectId
});

export const productIdSchema = z.object({
    productId: objectId
});

export const productVariantParamsSchema = z.object({
    productId: objectId,
    variantId: objectId
});