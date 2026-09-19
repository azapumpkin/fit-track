import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fittrack-secret-key";

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
        const payload = jwt.verify(
            token,
            JWT_SECRET,
        ) as {
            userId: number;
        };

        req.userId = payload.userId;

        next();
    } catch {
        res.status(401).json({
            message: "Недействительный токен",
        });
    }
}