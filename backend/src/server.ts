import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { userController } from "./controllers/userController.js";
import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import foodEntryRoutes from "./routes/foodEntryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        message: "FitTrack API is running!",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/food-entries", foodEntryRoutes);

const frontendDirectory = path.resolve(
    process.cwd(),
    "frontend",
    "dist",
);

if (fs.existsSync(frontendDirectory)) {
    app.use(express.static(frontendDirectory));

    app.use((req, res, next) => {
        if (
            req.method !== "GET" ||
            req.path.startsWith("/api/")
        ) {
            next();
            return;
        }

        res.sendFile(
            path.join(frontendDirectory, "index.html"),
            (error) => {
                if (error) {
                    next(error);
                }
            },
        );
    });
}

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `FitTrack API is running on port ${PORT}`,
    );
});
