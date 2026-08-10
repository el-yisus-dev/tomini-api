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


const router = Router();

router.use(protect);

router.post("/", validate(createCategorySchema), createCategory);


router.get("/", getAllCategories);


router.get("/:id", validate(objectIdSchema, "params"), getCategoryById);


router.patch("/:id", validate(objectIdSchema, "params"), validate(updateCategorySchema), updateCategory);


router.delete("/:id", validate(objectIdSchema, "params"), deleteCategory);


export default router;