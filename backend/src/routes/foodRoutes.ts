import { Router } from "express";
import { foodController } from "../controllers/foodController.js";

const router = Router();

router.get("/", foodController.getFoods);

router.post("/", foodController.createFood);

router.put("/:id", foodController.updateFood);

router.delete("/:id", foodController.deleteFood);

export default router;