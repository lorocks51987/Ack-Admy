import { Router, type IRouter } from "express";

const router: IRouter = Router();

const store = new Map<string, unknown>();

router.get("/api/progress/:deviceId", (req, res) => {
  const data = store.get(req.params.deviceId) ?? null;
  res.json({ data });
});

router.post("/api/progress/:deviceId", (req, res) => {
  store.set(req.params.deviceId, req.body);
  res.json({ ok: true });
});

export default router;
