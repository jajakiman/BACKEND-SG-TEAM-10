import express from "express";
import { addJournal, getJournals, updateJournal, deleteJournal } from "../controllers/journalController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addJournal);
router.get("/", authMiddleware, getJournals);
router.put("/:id", authMiddleware, updateJournal);
router.delete("/:id", authMiddleware, deleteJournal);

export default router;
