import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:id", authMiddleware, getUserProfile);
router.put("/:id", authMiddleware, updateUserProfile);

export default router;
