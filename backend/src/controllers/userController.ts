import { Request, Response } from "express";

import { userService } from "../services/userService.js";

type AuthRequest = Request & {
    userId?: number;
};

function getUserId(req: Request): number {
    return Number(
        (req as AuthRequest).userId,
    );
}

function formatUser(user: {
    id: number;
    name: string;
    email: string;
    gender: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    goal: string | null;
    activityLevel: string | null;
    dailyCalories: number | null;
    dailyProtein: number | null;
    dailyFat: number | null;
    dailyCarbs: number | null;
    createdAt: Date;
}) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        activityLevel: user.activityLevel,
        dailyCalories: user.dailyCalories,
        dailyProtein: user.dailyProtein,
        dailyFat: user.dailyFat,
        dailyCarbs: user.dailyCarbs,
        createdAt: user.createdAt,
    };
}

export const userController = {
    async getCurrentUser(
        req: Request,
        res: Response,
    ) {
        const userId = getUserId(req);

        const user =
            await userService.getUserById(userId);

        if (!user) {
            res.status(404).json({
                message: "Профиль не найден",
            });

            return;
        }

        res.json(formatUser(user));
    },

    async getUserById(
        req: Request,
        res: Response,
    ) {
        const userId = getUserId(req);

        const user =
            await userService.getUserById(userId);

        if (!user) {
            res.status(404).json({
                message: "Профиль не найден",
            });

            return;
        }

        res.json(formatUser(user));
    },

    async updateUser(
        req: Request,
        res: Response,
    ) {
        const userId = getUserId(req);

        const {
            name,
            email,
            gender,
            age,
            height,
            weight,
            goal,
            activityLevel,
            dailyCalories,
            dailyProtein,
            dailyFat,
            dailyCarbs,
        } = req.body;


        const user =
            await userService.updateUser(
                userId,
                name,
                email,
                gender ?? null,
                age ?? null,
                height ?? null,
                weight ?? null,
                goal ?? null,
                activityLevel ?? null,
                dailyCalories ?? null,
                dailyProtein ?? null,
                dailyFat ?? null,
                dailyCarbs ?? null,
            );


        res.json(formatUser(user));
    },

    async deleteUser(
        req: Request,
        res: Response,
    ) {
        const userId = getUserId(req);

        await userService.deleteUser(userId);

        res.json({
            message: "Профиль удалён",
        });
    },
};