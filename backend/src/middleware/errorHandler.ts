import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    console.error(err);

    if (
        err.message ===
        "Нельзя удалить продукт, который уже используется в дневнике"
    ) {
        res.status(400).json({
            message: err.message,
        });

        return;
    }

    res.status(500).json({
        message: "Internal server error",
    });
}