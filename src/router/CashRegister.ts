import { Router } from "express";

import {
    openCashRegister,
    getCurrentCashRegister,
    closeCashRegister
} from "../controllers/cashRegister.js";

import { protect } from "../middleware/auth.js";
import { verifyRole } from "../middleware/ACL.js";
import { validate } from "../middleware/validateSchemas.js";

import {
    openCashRegisterSchema,
    closeCashRegisterSchema
} from "../schemas/cashRegister.schema.js";

import { UserRole } from "../types/User.js";
import { createCashMovement } from "../controllers/CashMovement.js";
import { createCashMovementSchema } from "../schemas/CashMovement.schema.js";

const router = Router();

router.use(protect);

router.use(verifyRole([UserRole.ADMIN]));

router.post(
    "/open",
    validate(openCashRegisterSchema),
    openCashRegister
);

router.get(
    "/current",
    getCurrentCashRegister
);

router.post(
    "/close",
    validate(closeCashRegisterSchema),
    closeCashRegister
);

router.post(
    "/movements",
    validate(createCashMovementSchema),
    createCashMovement
);

export default router;
