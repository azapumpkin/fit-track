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
            include: {
                food: true,
                user: true,
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

    delete(id: number, userId: number) {
        return prisma.foodEntry.delete({
            where: {
                id,
                userId,
            },
        });
    },
};