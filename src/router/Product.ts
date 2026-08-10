import { Router } from "express";

import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/Product.js";

import {
    createProductVariant,
    getAllProductVariants,
    getProductVariantById,
    updateProductVariant,
    deleteProductVariant
} from "../controllers/ProductVariant.js";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validateSchemas.js";
import { verifyRole } from "../middleware/ACL.js";

import {
    createProductSchema,
    updateProductSchema
} from "../schemas/product.schema.js";

import {
    createProductVariantSchema,
    updateProductVariantSchema
} from "../schemas/productVariant.schema.js";

import {
    objectIdSchema,
    productIdSchema,
    productVariantParamsSchema
} from "../schemas/id.schema.js";

import { UserRole } from "../types/User.js";

const router = Router();

router.use(protect);

router.post(
    "/",
    verifyRole([UserRole.ADMIN]),
    validate(createProductSchema),
    createProduct
);

router.get(
    "/",
    getAllProducts
);

router.get(
    "/:id",
    validate(objectIdSchema, "params"),
    getProductById
);

router.patch(
    "/:id",
    verifyRole([UserRole.ADMIN]),
    validate(objectIdSchema, "params"),
    validate(updateProductSchema),
    updateProduct
);

router.delete(
    "/:id",
    verifyRole([UserRole.ADMIN]),
    validate(objectIdSchema, "params"),
    deleteProduct
);

// Product Variants

router.post(
    "/:productId/variants",
    verifyRole([UserRole.ADMIN]),
    validate(productIdSchema, "params"),
    validate(createProductVariantSchema),
    createProductVariant
);

router.get(
    "/:productId/variants",
    validate(productIdSchema, "params"),
    getAllProductVariants
);

router.get(
    "/:productId/variants/:variantId",
    validate(productVariantParamsSchema, "params"),
    getProductVariantById
);

router.patch(
    "/:productId/variants/:variantId",
    verifyRole([UserRole.ADMIN]),
    validate(productVariantParamsSchema, "params"),
    validate(updateProductVariantSchema),
    updateProductVariant
);

router.delete(
    "/:productId/variants/:variantId",
    verifyRole([UserRole.ADMIN]),
    validate(productVariantParamsSchema, "params"),
    deleteProductVariant
);

export default router;