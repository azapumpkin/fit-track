import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

const parsedDatabaseUrl = new URL(databaseUrl);

// These parameters belong to Prisma's native engine. The pg adapter
// receives the equivalent pool settings as explicit options below.
parsedDatabaseUrl.searchParams.delete("pgbouncer");
parsedDatabaseUrl.searchParams.delete("connection_limit");
parsedDatabaseUrl.searchParams.delete("connect_timeout");
parsedDatabaseUrl.searchParams.delete("pool_timeout");

const adapter = new PrismaPg({
    connectionString: parsedDatabaseUrl.toString(),
    // The authenticated UI loads profile, diary, foods and summary
    // concurrently. Keep enough connections for that initial burst.
    max: 5,
    connectionTimeoutMillis: 10_000,
});

export const prisma = new PrismaClient({
    adapter,
});
