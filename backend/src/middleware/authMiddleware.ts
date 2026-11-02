import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export type AuthRequest = Request & {
    userId?: number;
};

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            message: "Требуется авторизация",
        });

        return;
    }

    const token = authHeader.replace(
        "Bearer ",
        "",
    );

    try {
        const payload = jwt.verify(token, jwtConfig.secret, {
            algorithms: [jwtConfig.algorithm],
        }) as {
            userId: number;
        };

        if (!Number.isInteger(payload.userId) || payload.userId <= 0) {
            throw new Error("Invalid JWT subject");
        }

        req.userId = payload.userId;

        next();
    } catch {
        res.status(401).json({
            message: "Недействительный токен",
        });
    }
}
