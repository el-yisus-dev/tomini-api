import { configDotenv } from "dotenv";

configDotenv();

const config = {
    port: process.env.PORT,
    databaseUri: process.env.MONGO_URI ?? "",
    nameDd: process.env.DATABASE_NAME,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpires: process.env.JWT_EXPIRES_IN
};

export default config;