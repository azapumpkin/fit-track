import { Request, Response } from "express";

import { authService } from "../services/authService.js";

export const authController = {
    async register(
        req: Request,
        res: Response,
    ) {
        const { name, email, password } =
            req.body;

        if (!name || !email || !password) {
            res.status(400).json({
                message:
                    "Имя, email и пароль обязательны",
            });

            return;
        }

        if (password.length < 6) {
            res.status(400).json({
                message:
                    "Пароль должен содержать минимум 6 символов",
            });

            return;
        }

        try {
            const user =
                await authService.register(
                    name,
                    email,
                    password,
                );

            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
            });
        } catch (error) {
            console.error(
                "REGISTER ERROR:",
                error,
            );

            if (
                error instanceof Error &&
                error.message.includes(
                    "Unique constraint",
                )
            ) {
                res.status(409).json({
                    message:
                        "Пользователь с таким email уже существует",
                });

                return;
            }

            throw error;
        }
    },

    async login(
        req: Request,
        res: Response,
    ) {
        const { email, password } =
            req.body;

        if (!email || !password) {
            res.status(400).json({
                message:
                    "Email и пароль обязательны",
            });

            return;
        }

        try {
            const result =
                await authService.login(
                    email,
                    password,
                );

            res.json(result);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                "Неверный email или пароль"
            ) {
                res.status(401).json({
                    message:
                        "Неверный email или пароль",
                });

                return;
            }

            throw error;
        }
    },
};