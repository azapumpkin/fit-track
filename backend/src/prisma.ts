import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});