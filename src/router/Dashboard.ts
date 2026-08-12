import { Router } from "express";

import { getDashboard } from "../controllers/Dashboard.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getDashboard);

export default router;