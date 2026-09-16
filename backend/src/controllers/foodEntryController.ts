import { Request, Response } from "express";
import { foodEntryService } from "../services/foodEntryService.js";

export const foodEntryController = {
  async getFoodEntries(req: Request, res: Response) {
    const userId = Number(
      (req as Request & { userId?: number }).userId,
    );

    const { date } = req.query;

    const foodEntries =
      await foodEntryService.getFoodEntries(
        userId,
        date
          ? new Date(String(date))
          : undefined,
      );

    res.json(foodEntries);
  },

  async getDailySummary(
    req: Request,
    res: Response,
  ) {
    const userId = Number(
      (req as Request & { userId?: number }).userId,
    );

    const { date } = req.query;

    const summary =
      await foodEntryService.getDailySummary(
        userId,
        date
          ? new Date(String(date))
          : undefined,
      );

    res.json(summary);
  },

  async createFoodEntry(
    req: Request,
    res: Response,
  ) {
    const userId = Number(
      (req as Request & { userId?: number }).userId,
    );

    const {
      foodId,
      amount,
      date,
    } = req.body;

    const foodEntry =
      await foodEntryService.createFoodEntry(
        userId,
        foodId,
        amount,
        new Date(`${date}T12:00:00`),
      );

    res.json(foodEntry);
  },

  async deleteFoodEntry(
    req: Request,
    res: Response,
  ) {
    const userId = Number(
      (req as Request & { userId?: number }).userId,
    );

    const id = Number(req.params.id);

    await foodEntryService.deleteFoodEntry(
      id,
      userId,
    );

    res.json({
      message:
        "Food entry deleted successfully",
    });
  },
};