import { Router } from "express";

import { getDashboard } from "../controllers/Dashboard.js";
import { protect } from "../middleware/auth.js";
import { verifyRole } from "../middleware/ACL.js";
import { UserRole } from "../types/User.js";

const router = Router();

router.use(protect);
router.use(verifyRole([UserRole.ADMIN]));

router.get("/", getDashboard);

export default router;