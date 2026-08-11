import mongoose from "mongoose";
import config from "./config.js";

export const connectToMongoDB = async (): Promise<void> => {
    try {
        const connection = await mongoose.connect(
            config.databaseUri
        );

        console.log(
            `Successfully connected to MongoDB: ${connection.connection.host}`
        );
    } catch (error) {
        const err = error as Error;

        console.error("Error connecting to MongoDB", {
            message: err.message,
            stack: err.stack
        });

        process.exit(1);
    }
};

mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost");
});

mongoose.connection.on("error", (error) => {
    console.error(
        "MongoDB connection error:",
        error.message
    );
});