import express, { type Express } from "express";
import { connectToMongoDB } from "./config/db.js";
import cors from "cors";
import morgan from "morgan";

import { routerAPI } from "./router/index.js";
import { errorHandler } from "./middleware/Error.js";

const app: Express = express();

// connect to db
await connectToMongoDB();

// Config morgan middleware to add logs
app.use(morgan("dev"));

// Config cors
app.use(cors());

// Config middleware to response json
app.use(express.json());

// Adding the main router
routerAPI(app);

//Error handler middleware
app.use(errorHandler)

export default app;