import express from "express";
import { addMood, getMoods, getWeeklyStats } from "../controllers/moodController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addMood);
router.get("/", authMiddleware, getMoods);
router.get("/weekly", authMiddleware, getWeeklyStats);

export default router;
