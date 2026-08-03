import express, { type Router } from "express";

import { login, me } from "../controllers/Auth.js";
import { validate } from "../middleware/validateSchemas.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { protect } from "../middleware/auth.js";

const router: Router = express.Router();

router.post("/login", validate(loginSchema), login);

router.get("/me", protect, me);

export default router;