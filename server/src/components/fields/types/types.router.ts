import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  return res.json([
    { name: "String" },
    { name: "Number" },
    { name: "Boolean" },
  ]);
});

export default router;
