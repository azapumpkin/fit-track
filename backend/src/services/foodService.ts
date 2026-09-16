import { foodRepository } from "../repositories/foodRepository.js";

export const foodService = {
    getFoods() {
        return foodRepository.findAll();
    },

    createFood(
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return foodRepository.create(
            name,
            calories,
            protein,
            fat,
            carbs,
        );
    },

    updateFood(
        id: number,
        name: string,
        calories: number,
        protein: number,
        fat: number,
        carbs: number,
    ) {
        return foodRepository.update(
            id,
            name,
            calories,
            protein,
            fat,
            carbs,
        );
    },

    async deleteFood(id: number) {
        const entriesCount =
            await foodRepository.countFoodEntries(id);

        if (entriesCount > 0) {
            throw new Error(
                "Нельзя удалить продукт, который уже используется в дневнике",
            );
        }

        return foodRepository.delete(id);
    },
};