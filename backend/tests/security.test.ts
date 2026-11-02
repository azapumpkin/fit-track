import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-only-jwt-secret-with-at-least-32-characters";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

type FoodRow = {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    isCustom: boolean;
    ownerId: number | null;
};

const state = vi.hoisted(() => ({
    foods: [] as FoodRow[],
    foodEntries: [] as Array<Record<string, unknown>>,
}));

const prisma = vi.hoisted(() => ({
    food: {
        findMany: vi.fn(async ({ where }: any) =>
            state.foods.filter(
                (food) =>
                    food.ownerId === null ||
                    where.OR.some((condition: any) => condition.ownerId === food.ownerId),
            )),
        create: vi.fn(async ({ data }: any) => {
            const created = {
                id: Math.max(0, ...state.foods.map((food) => food.id)) + 1,
                ...data,
            };
            state.foods.push(created);
            return created;
        }),
        updateMany: vi.fn(async ({ where, data }: any) => {
            const food = state.foods.find(
                (candidate) => candidate.id === where.id && candidate.ownerId === where.ownerId,
            );
            if (!food) return { count: 0 };
            Object.assign(food, data);
            return { count: 1 };
        }),
        deleteMany: vi.fn(async ({ where }: any) => {
            const index = state.foods.findIndex(
                (food) => food.id === where.id && food.ownerId === where.ownerId,
            );
            if (index === -1) return { count: 0 };
            state.foods.splice(index, 1);
            return { count: 1 };
        }),
        findFirst: vi.fn(async ({ where }: any) =>
            state.foods.find(
                (food) =>
                    food.id === where.id &&
                    (food.ownerId === null || food.ownerId === where.OR[1].ownerId),
            ) ?? null,
        ),
    },
    foodEntry: {
        findMany: vi.fn(async () => state.foodEntries),
        count: vi.fn(async () => 0),
        create: vi.fn(async ({ data }: any) => ({ id: 99, ...data })),
        delete: vi.fn(),
    },
    user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    $disconnect: vi.fn(),
}));

vi.mock("../src/prisma.js", () => ({ prisma }));

const { app } = await import("../src/app.js");

const validSecret = process.env.JWT_SECRET!;
const tokenFor = (userId: number) => jwt.sign({ userId }, validSecret, { algorithm: "HS256" });
const auth = (userId: number) => ({ Authorization: `Bearer ${tokenFor(userId)}` });

beforeEach(() => {
    state.foods = [
        { id: 1, name: "System", calories: 1, protein: 1, fat: 1, carbs: 1, isCustom: true, ownerId: null },
        { id: 2, name: "User A", calories: 2, protein: 2, fat: 2, carbs: 2, isCustom: true, ownerId: 10 },
        { id: 3, name: "User B", calories: 3, protein: 3, fat: 3, carbs: 3, isCustom: true, ownerId: 20 },
    ];
    state.foodEntries = [];
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("P0 API isolation", () => {
    it.each([
        ["post", "/api/foods"],
        ["put", "/api/foods/2"],
        ["delete", "/api/foods/2"],
    ] as const)("rejects anonymous %s %s", async (method, path) => {
        const response = await request(app)[method](path).send({});
        expect(response.status).toBe(401);
    });

    it("shows only system and own products", async () => {
        const response = await request(app).get("/api/foods").set(auth(10));
        expect(response.status).toBe(200);
        expect(response.body.map((food: FoodRow) => food.id)).toEqual([1, 2]);
        expect(response.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ ownerId: expect.anything() })]));
    });

    it("prevents user A from updating or deleting user B products", async () => {
        const update = await request(app)
            .put("/api/foods/3")
            .set(auth(10))
            .send({ name: "stolen", calories: 0, protein: 0, fat: 0, carbs: 0 });
        const deletion = await request(app).delete("/api/foods/3").set(auth(10));

        expect(update.status).toBe(404);
        expect(deletion.status).toBe(404);
        expect(state.foods.find((food) => food.id === 3)?.name).toBe("User B");
    });

    it("keeps system products read-only", async () => {
        const update = await request(app)
            .put("/api/foods/1")
            .set(auth(10))
            .send({ name: "changed", calories: 0, protein: 0, fat: 0, carbs: 0 });
        const deletion = await request(app).delete("/api/foods/1").set(auth(10));

        expect(update.status).toBe(404);
        expect(deletion.status).toBe(404);
        expect(state.foods.find((food) => food.id === 1)?.name).toBe("System");
    });

    it("assigns new products to the authenticated user", async () => {
        const response = await request(app)
            .post("/api/foods")
            .set(auth(10))
            .send({ name: "New", calories: 4, protein: 4, fat: 4, carbs: 4, isCustom: false });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ name: "New", isOwner: true });
        expect(response.body).not.toHaveProperty("ownerId");
        expect(state.foods.at(-1)?.ownerId).toBe(10);
    });

    it("prevents user A from adding user B product to the diary", async () => {
        const response = await request(app)
            .post("/api/food-entries")
            .set(auth(10))
            .send({ foodId: 3, amount: 100, date: "2026-11-02" });
        expect(response.status).toBe(404);
        expect(prisma.foodEntry.create).not.toHaveBeenCalled();
    });

    it("does not expose user or passwordHash in diary responses", async () => {
        state.foodEntries = [{
            id: 7,
            userId: 10,
            foodId: 2,
            amount: 100,
            date: new Date("2026-11-02T12:00:00Z"),
            food: { id: 2, name: "User A", calories: 2, protein: 2, fat: 2, carbs: 2, isCustom: true },
        }];

        const response = await request(app).get("/api/food-entries").set(auth(10));
        expect(response.status).toBe(200);
        expect(JSON.stringify(response.body)).not.toContain("passwordHash");
        expect(response.body[0]).not.toHaveProperty("user");

        const query = prisma.foodEntry.findMany.mock.calls[0][0];
        expect(query.select).toBeDefined();
        expect(query.select).not.toHaveProperty("user");
    });

    it("rejects a JWT signed with another secret", async () => {
        const forged = jwt.sign(
            { userId: 10 },
            "attacker-controlled-secret-with-at-least-32-characters",
            { algorithm: "HS256" },
        );
        const response = await request(app)
            .get("/api/foods")
            .set({ Authorization: `Bearer ${forged}` });
        expect(response.status).toBe(401);
    });
});
