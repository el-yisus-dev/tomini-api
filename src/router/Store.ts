import { Router } from "express";
import {
    createStore,
    getStoreById,
    getAllStores,
    updateStore,
    deleteStore
} from "../controllers/Store.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validateSchemas.js";
import {
    createStoreSchema,
    updateStoreSchema
} from "../schemas/store.schema.js";
import { objectIdSchema } from "../schemas/id.schema.js";

const router = Router();

router.use(protect);

router.post( "/", validate(createStoreSchema), createStore);

router.get("/", getAllStores);

router.get("/:id",  validate(objectIdSchema, "params"), getStoreById);

router.patch("/:id",  validate(objectIdSchema, "params"), validate(updateStoreSchema), updateStore);

router.delete("/:id",  validate(objectIdSchema, "params"), deleteStore);

export default router;