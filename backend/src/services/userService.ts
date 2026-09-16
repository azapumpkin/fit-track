import { userRepository } from "../repositories/userRepository.js";
import { nutritionService } from "./nutritionService.js";

export const userService = {
    getUsers() {
        return userRepository.findAll();
    },

    getUserById(id: number) {
        return userRepository.findById(id);
    },

    updateUser(
        id: number,
        name: string,
        email: string,
        gender: string | null,
        age: number | null,
        height: number | null,
        weight: number | null,
        goal: string | null,
        activityLevel: string | null,
        dailyCalories: number | null,
        dailyProtein: number | null,
        dailyFat: number | null,
        dailyCarbs: number | null,
    ) {
        let calculatedCalories = dailyCalories;
        let calculatedProtein = dailyProtein;
        let calculatedFat = dailyFat;
        let calculatedCarbs = dailyCarbs;

        if (
            gender &&
            age !== null &&
            height !== null &&
            weight !== null &&
            goal &&
            activityLevel
        ) {
            const nutrition = nutritionService.calculate({
                gender,
                age,
                height,
                weight,
                goal,
                activityLevel,
            });

            calculatedCalories = nutrition.dailyCalories;
            calculatedProtein = nutrition.dailyProtein;
            calculatedFat = nutrition.dailyFat;
            calculatedCarbs = nutrition.dailyCarbs;
        }

        return userRepository.update(
            id,
            name,
            email,
            gender,
            age,
            height,
            weight,
            goal,
            activityLevel,
            calculatedCalories,
            calculatedProtein,
            calculatedFat,
            calculatedCarbs,
        );
    },

    deleteUser(id: number) {
        return userRepository.delete(id);
    },
};