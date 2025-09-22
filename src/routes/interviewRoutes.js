import express from "express";
import { addInterview, getInterviews } from "../controllers/interviewController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addInterview);
router.get("/", authMiddleware, getInterviews);

export default router;
