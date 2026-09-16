import express from "express";
import cors from "cors";
import { userController } from "./controllers/userController.js";
import userRoutes from "./routes/userRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import foodEntryRoutes from "./routes/foodEntryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = 3000;

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
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`FitTrack API is running on http://localhost:${PORT}`);
});