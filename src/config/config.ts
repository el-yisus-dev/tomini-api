import { configDotenv } from "dotenv";

configDotenv();

const config = {
    port: process.env.PORT,
    databaseUri: process.env.DATABASE_URL,
    nameDd: process.env.DATABASE_NAME,
};

export default config;