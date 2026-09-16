import { prisma } from "../prisma.js";

export const foodRepository = {
    findAll() {
        return prisma.food.findMany();
    },

    create(
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return prisma.food.create({
            data: {
                name,
                calories,
                protein,
                fat,
                carbs,
            },
        });
    },

    update(
        id: number,
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return prisma.food.update({
            where: {
                id,
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

    countFoodEntries(foodId: number) {
        return prisma.foodEntry.count({
            where: {
                foodId,
            },
        });
    },

    delete(id: number) {
        return prisma.food.delete({
            where: {
                id,
            },
        });
    },
};