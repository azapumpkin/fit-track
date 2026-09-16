import { foodEntryRepository } from "../repositories/foodEntryRepository.js";

export const foodEntryService = {
  async getFoodEntries(
    userId: number,
    date?: Date,
  ) {
    const foodEntries =
      await foodEntryRepository.findAll(
        userId,
        date,
      );

    return foodEntries.map((entry) => {
      const multiplier = entry.amount / 100;

      return {
        ...entry,
        calories:
          entry.food.calories * multiplier,
        protein:
          entry.food.protein * multiplier,
        fat: entry.food.fat * multiplier,
        carbs:
          entry.food.carbs * multiplier,
      };
    });
  },

  async getDailySummary(
    userId: number,
    date?: Date,
  ) {
    const foodEntries =
      await foodEntryRepository.findAll(
        userId,
        date,
      );

    return foodEntries.reduce(
      (summary, entry) => {
        const multiplier = entry.amount / 100;

        summary.calories +=
          entry.food.calories * multiplier;

        summary.protein +=
          entry.food.protein * multiplier;

        summary.fat +=
          entry.food.fat * multiplier;

        summary.carbs +=
          entry.food.carbs * multiplier;

        return summary;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
    );
  },

  createFoodEntry(
    userId: number,
    foodId: number,
    amount: number,
    date: Date,
  ) {
    return foodEntryRepository.create(
      userId,
      foodId,
      amount,
      date,
    );
  },

  deleteFoodEntry(
    id: number,
    userId: number,
  ) {
    return foodEntryRepository.delete(
      id,
      userId,
    );
  },
};