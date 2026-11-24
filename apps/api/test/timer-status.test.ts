import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Room Timer & Live Status Tags", () => {
  const app = createApp();

  const studentAuth = { Authorization: "Bearer student-token" };
  const adminAuth = {
    Authorization: "Bearer admin-token",
    "x-mock-role": "admin",
  };

  describe("Synchronized Timer", () => {
    it("GET /api/rooms/:id/timer returns the synchronized timer state", async () => {
      const res = await request(app).get("/api/rooms/dev-room-1/timer");
      expect(res.status).toBe(200);
      expect(res.body.timer).toBeDefined();
      expect(res.body.timer.phase).toBe("focus");
      expect(res.body.timer.phase_duration_minutes).toBe(50);
      expect(res.body.timer.is_running).toBeDefined();
    });

    it("POST /api/rooms/:id/timer rejects timer control from non-admin (PRD FR-TIMER-05)", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-1/timer")
        .set(studentAuth)
        .send({ action: "start" });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Admin access required");
    });

    it("POST /api/rooms/:id/timer allows admin to start the timer", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-1/timer")
        .set(adminAuth)
        .send({ action: "start" });

      expect(res.status).toBe(200);
      expect(res.body.timer.is_running).toBe(true);
      expect(res.body.timer.phase_end_at).toBeDefined();
    });

    it("POST /api/rooms/:id/timer allows admin to advance the timer to break phase", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-1/timer")
        .set(adminAuth)
        .send({ action: "advance" });

      expect(res.status).toBe(200);
      expect(res.body.timer.phase).toBe("break");
      expect(res.body.timer.phase_duration_minutes).toBe(10);
      expect(res.body.timer.is_running).toBe(true);
    });

    it("POST /api/rooms/:id/timer allows admin to reset the timer to default 50 focus", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-1/timer")
        .set(adminAuth)
        .send({ action: "reset" });

      expect(res.status).toBe(200);
      expect(res.body.timer.phase).toBe("focus");
      expect(res.body.timer.phase_duration_minutes).toBe(50);
      expect(res.body.timer.is_running).toBe(false);
    });
  });

  describe("Live Study Status Tags (PRD FR-STATUS-01–04)", () => {
    it("GET /api/rooms/:id/status returns list of participant statuses", async () => {
      const res = await request(app).get("/api/rooms/dev-room-1/status");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.statuses)).toBe(true);
      expect(res.body.statuses.length).toBeGreaterThan(0);
    });

    it("PUT /api/rooms/:id/status allows participant to update their status tag", async () => {
      const res = await request(app)
        .put("/api/rooms/dev-room-1/status")
        .set(studentAuth)
        .send({ status: "Chapter 1 – Differential Equations" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Chapter 1 – Differential Equations");
    });

    it("PUT /api/rooms/:id/status rejects status tags longer than 60 characters (PRD FR-STATUS-04)", async () => {
      const overLongStatus = "A".repeat(61);
      const res = await request(app)
        .put("/api/rooms/dev-room-1/status")
        .set(studentAuth)
        .send({ status: overLongStatus });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("between 1 and 60 characters");
    });

    it("PUT /api/rooms/:id/status clears the status tag if empty or whitespace only", async () => {
      const res = await request(app)
        .put("/api/rooms/dev-room-1/status")
        .set(studentAuth)
        .send({ status: "   " });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("cleared");
      expect(res.body.status).toBeNull();
    });
  });
});
