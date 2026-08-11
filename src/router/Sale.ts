import { Router } from "express";

import {
    createSale,
    getAllSales,
    getSaleById,
    cancelSale
} from "../controllers/Sale.js";
import { protect } from "../middleware/auth.js";
import { createSaleSchema } from "../schemas/sale.schema.js";
import { validate } from "../middleware/validateSchemas.js";


const router = Router();

router.use(protect);

router.post(
    "/",
    validate(createSaleSchema),
    createSale
);

router.get(
    "/",
    getAllSales
);

router.get(
    "/:id",
    getSaleById
);

router.patch(
    "/:id/cancel",
    cancelSale
);

export default router;