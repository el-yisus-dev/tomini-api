import express, { type Router } from 'express';

import { createUser, getAllUsers, getUserById } from '../controllers/User.js';
import { createUserSchema } from '../schemas/user.schema.js';
import { validate } from '../middleware/validateSchemas.js';
import { objectIdSchema } from '../schemas/id.schema.js';

const router: Router = express.Router()

router.post("/", validate(createUserSchema), createUser);

router.get("/", getAllUsers);

router.get("/:id", validate(objectIdSchema, "params"), getUserById);


export default router