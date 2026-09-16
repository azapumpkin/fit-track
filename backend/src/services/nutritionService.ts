type NutritionInput = {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    goal: string;
};

type NutritionResult = {
    dailyCalories: number;
    dailyProtein: number;
    dailyFat: number;
    dailyCarbs: number;
};

export const nutritionService = {
    calculate(input: NutritionInput): NutritionResult {
        const { gender, age, height, weight, activityLevel, goal } = input;

        // BMR — базовый обмен веществ по формуле Mifflin–St Jeor
        let bmr: number;

        if (gender === "female") {
            bmr =
                10 * weight +
                6.25 * height -
                5 * age -
                161;
        } else {
            bmr =
                10 * weight +
                6.25 * height -
                5 * age +
                5;
        }

        // Коэффициент физической активности
        const activityMultipliers: Record<string, number> = {
            low: 1.2,
            light: 1.375,
            moderate: 1.55,
            high: 1.725,
            very_high: 1.9,
        };

        const activityMultiplier =
            activityMultipliers[activityLevel] ?? 1.2;

        // TDEE — примерный расход калорий за день
        const tdee = bmr * activityMultiplier;

        // Корректировка под цель
        let calories = tdee;

        if (goal === "lose_weight") {
            calories = tdee * 0.85;
        } else if (goal === "gain_weight") {
            calories = tdee * 1.1;
        }

        const dailyCalories = Math.round(calories);

        // БЖУ
        // Белок: 1.6 г на кг веса
        const dailyProtein = Math.round(weight * 1.6);

        // Жиры: 30% от дневной калорийности
        const dailyFat = Math.round(
            (dailyCalories * 0.3) / 9,
        );

        // Остаток калорий отдаём углеводам
        const proteinCalories = dailyProtein * 4;
        const fatCalories = dailyFat * 9;

        const dailyCarbs = Math.round(
            Math.max(
                0,
                (dailyCalories -
                    proteinCalories -
                    fatCalories) /
                4,
            ),
        );

        return {
            dailyCalories,
            dailyProtein,
            dailyFat,
            dailyCarbs,
        };
    },
};