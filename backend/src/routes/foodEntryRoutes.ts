import { Router } from "express";
import { foodEntryController } from "../controllers/foodEntryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
    "/summary",
    foodEntryController.getDailySummary,
);

router.get(
    "/",
    foodEntryController.getFoodEntries,
);

router.post(
    "/",
    foodEntryController.createFoodEntry,
);

router.delete(
    "/:id",
    foodEntryController.deleteFoodEntry,
);

export default router;