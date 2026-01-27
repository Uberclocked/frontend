import cors from "cors";
import express from "express";

import componentRouter from "./components/components.router";
import typeRouter from "./components/fields/types/types.router";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/components", componentRouter);
app.use("/api/components/fields/types", typeRouter);
