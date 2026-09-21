import {
    PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import type {
    NextFunction,
    Request,
    Response,
} from "express";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    console.error(err);

    if (
        err instanceof PrismaClientKnownRequestError
    ) {
        if (err.code === "P2002") {
            res.status(409).json({
                message:
                    "Запись с такими данными уже существует",
            });
            return;
        }

        if (err.code === "P2003") {
            res.status(400).json({
                message:
                    "Связанная запись не найдена",
            });
            return;
        }

        if (err.code === "P2025") {
            res.status(404).json({
                message: "Запись не найдена",
            });
            return;
        }
    }

    res.status(500).json({
        message:
            "Сервер временно недоступен. Попробуйте ещё раз.",
    });
}
