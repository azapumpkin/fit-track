import { prisma } from "../prisma.js";

export const foodEntryRepository = {
    findAll(userId: number, date?: Date) {
        return prisma.foodEntry.findMany({
            where: {
                userId,
                ...(date
                    ? {
                        date: {
                            gte: new Date(
                                date.setHours(0, 0, 0, 0),
                            ),
                            lt: new Date(
                                date.setHours(23, 59, 59, 999),
                            ),
                        },
                    }
                    : {}),
            },
            select: {
                id: true,
                userId: true,
                foodId: true,
                amount: true,
                date: true,
                food: {
                    select: {
                        id: true,
                        name: true,
                        calories: true,
                        protein: true,
                        fat: true,
                        carbs: true,
                        isCustom: true,
                    },
                },
            },
        });
    },

    create(
        userId: number,
        foodId: number,
        amount: number,
        date: Date,
    ) {
        return prisma.foodEntry.create({
            data: {
                userId,
                foodId,
                amount,
                date,
            },
        });
    },

    findAccessibleFood(foodId: number, userId: number) {
        return prisma.food.findFirst({
            where: {
                id: foodId,
                OR: [{ ownerId: null }, { ownerId: userId }],
            },
            select: { id: true },
        });
    },

    delete(id: number, userId: number) {
        return prisma.foodEntry.delete({
            where: {
                id,
                userId,
            },
        });
    },
};
