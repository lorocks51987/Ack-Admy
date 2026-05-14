import { Router, type IRouter } from "express";
import { getProgress, saveProgress } from "../controllers/progressController";

const router: IRouter = Router();

// Mounted under /api in app.ts — final paths: GET/POST /api/progress/:deviceId
router.get("/progress/:deviceId", getProgress);
router.post("/progress/:deviceId", saveProgress);

export default router;
