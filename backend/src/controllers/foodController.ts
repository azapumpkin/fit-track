import { Request, Response } from "express";
import { foodService } from "../services/foodService.js";

export const foodController = {
    async getFoods(_req: Request, res: Response) {
        const foods = await foodService.getFoods();

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

    async createFood(req: Request, res: Response) {
        const {
            name,
            calories,
            protein,
            fat,
            carbs,
            isCustom,
        } = req.body;

        const food = await foodService.createFood(
            name,
            calories,
            protein,
            fat,
            carbs,
            isCustom !== false,
        );

        res.json(food);
    },

    async updateFood(req: Request, res: Response) {
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
            name,
            calories,
            protein,
            fat,
            carbs,
        );

        res.json(food);
    },

    async deleteFood(req: Request, res: Response) {
        const id = Number(req.params.id);

        await foodService.deleteFood(id);

        res.json({
            message: "Food deleted successfully",
        });
    },
};
