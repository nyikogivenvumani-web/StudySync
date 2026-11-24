import express from "express";
import cors from "cors";
import { institutionsRouter, modulesRouter } from "./modules/modules/modulesRouter.js";
import { roomsRouter } from "./modules/rooms/roomsRouter.js";
import { forumRouter } from "./modules/forum/forumRouter.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.WEB_ORIGIN || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/institutions", institutionsRouter);
  app.use("/api/modules", modulesRouter);
  app.use("/api/rooms", roomsRouter);
  app.use("/api/modules/:moduleId/forum", forumRouter);

  return app;
}
