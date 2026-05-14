import type { RequestHandler } from "express";
import { progressService } from "../services/progressService";

export const getProgress: RequestHandler = (req, res) => {
  const data = progressService.get(req.params.deviceId);
  res.json({ data });
};

export const saveProgress: RequestHandler = (req, res) => {
  progressService.save(req.params.deviceId, req.body);
  res.json({ ok: true });
};
