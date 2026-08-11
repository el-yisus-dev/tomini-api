import { Router } from "express";

import {
    getAllInventory,
    getInventoryById,
    adjustInventory
} from "../controllers/Inventory.js";

import {
    getInventoryMovements
} from "../controllers/InventoryMovement.js";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validateSchemas.js";

import {
    objectIdSchema,
} from "../schemas/id.schema.js";
import { updateInventorySchema } from "../schemas/inventory.schema.js";

const router = Router();

router.use(protect);

router.get(
    "/",
    getAllInventory
);

router.get(
    "/:id",
    validate(objectIdSchema, "params"),
    getInventoryById
);

router.patch(
    "/:id/adjust",
    validate(objectIdSchema, "params"),
    validate(updateInventorySchema),
    adjustInventory
);

router.get(
    "/:id/movements",
    validate(objectIdSchema, "params"),
    getInventoryMovements
);

export default router;