import express, { type Router } from 'express';

import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/User.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema.js';
import { validate } from '../middleware/validateSchemas.js';
import { objectIdSchema } from '../schemas/id.schema.js';

const router: Router = express.Router()

router.post("/", validate(createUserSchema), createUser);

router.get("/", getAllUsers);

router.get("/:id", validate(objectIdSchema, "params"), getUserById);

router.put("/:id", validate(objectIdSchema, "params"), validate(updateUserSchema), updateUser);

router.delete("/:id", validate(objectIdSchema, "params"), deleteUser);

export default router