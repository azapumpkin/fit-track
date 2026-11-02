import { prisma } from "../prisma.js";

export const foodRepository = {
    findAll(userId: number) {
        return prisma.food.findMany({
            where: {
                OR: [{ ownerId: null }, { ownerId: userId }],
            },
            orderBy: { id: "asc" },
        });
    },

    create(
        ownerId: number,
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
        isCustom = true,
    ) {
        return prisma.food.create({
            data: {
                name,
                calories,
                protein,
                fat,
                carbs,
                isCustom,
                ownerId,
            },
        });
    },

    update(
        id: number,
        ownerId: number,
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return prisma.food.updateMany({
            where: {
                id,
                ownerId,
            },
            data: {
                name,
                calories,
                protein,
                fat,
                carbs,
            },
        });
    },

    countFoodEntries(foodId: number, ownerId: number) {
        return prisma.foodEntry.count({
            where: {
                foodId,
                food: { ownerId },
            },
        });
    },

    delete(id: number, ownerId: number) {
        return prisma.food.deleteMany({
            where: {
                id,
                ownerId,
            },
        });
    },
};
