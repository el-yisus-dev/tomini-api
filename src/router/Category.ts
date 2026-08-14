import { Router } from "express";

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/Category.js";

import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validateSchemas.js";

import {
    createCategorySchema,
    updateCategorySchema
} from "../schemas/category.schema.js";

import { objectIdSchema } from "../schemas/id.schema.js";
import { verifyRole } from "../middleware/ACL.js";
import { UserRole } from "../types/User.js";


const router = Router();

router.use(protect);

router.post("/", verifyRole([UserRole.ADMIN]), validate(createCategorySchema), createCategory);


router.get("/", getAllCategories);


router.get("/:id", verifyRole([UserRole.ADMIN]), validate(objectIdSchema, "params"), getCategoryById);


router.patch("/:id", validate(objectIdSchema, "params"), verifyRole([UserRole.ADMIN]), validate(updateCategorySchema), updateCategory);


router.delete("/:id", validate(objectIdSchema, "params"), verifyRole([UserRole.ADMIN]), deleteCategory);


export default router;