import { Request, Response } from "express";
import { foodService } from "../services/foodService.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const foodController = {
    async getFoods(req: AuthRequest, res: Response) {
        const foods = await foodService.getFoods(req.userId!);

        res.json(foods);
    },

    async searchFoods(req: Request, res: Response) {
        const query = String(req.query.query ?? "").trim();

        if (!query) {
            res.status(400).json({
                message: "Поисковый запрос не может быть пустым",
            });

            return;
        }

        const foods =
            await foodService.searchExternalFoods(query);

        res.json(foods);
    },

    async createFood(req: AuthRequest, res: Response) {
        const {
            name,
            calories,
            protein,
            fat,
            carbs,
            isCustom,
        } = req.body;

        const food = await foodService.createFood(
            req.userId!,
            name,
            calories,
            protein,
            fat,
            carbs,
            isCustom !== false,
        );

        res.json(food);
    },

    async updateFood(req: AuthRequest, res: Response) {
        const id = Number(req.params.id);

        const {
            name,
            calories,
            protein,
            fat,
            carbs,
        } = req.body;

        const food = await foodService.updateFood(
            id,
            req.userId!,
            name,
            calories,
            protein,
            fat,
            carbs,
        );

        res.json(food);
    },

    async deleteFood(req: AuthRequest, res: Response) {
        const id = Number(req.params.id);

        await foodService.deleteFood(id, req.userId!);

        res.json({
            message: "Food deleted successfully",
        });
    },
};
