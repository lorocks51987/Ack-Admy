import type { RequestHandler } from "express";
import { progressService } from "../services/progressService";

export const getProgress: RequestHandler = (req, res) => {
  const data = progressService.get(req.params.deviceId as string);
  res.json({ data });
};

export const saveProgress: RequestHandler = (req, res) => {
  progressService.save(req.params.deviceId as string, req.body);
  res.json({ ok: true });
};
