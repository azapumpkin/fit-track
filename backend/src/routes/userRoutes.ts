import { Router } from "express";

import { userController } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
    "/me",
    userController.getCurrentUser,
);

router.put(
    "/me",
    userController.updateUser,
);

router.delete(
    "/me",
    userController.deleteUser,
);

router.get(
    "/:id",
    userController.getUserById,
);

export default router;
