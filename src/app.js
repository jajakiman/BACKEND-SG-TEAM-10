import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/moods", moodRoutes);
app.use("/journals", journalRoutes);
app.use("/interviews", interviewRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Mood.in API running 🚀" });
});

export default app;