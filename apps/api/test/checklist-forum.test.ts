import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Shared Session Checklist & Module Forum", () => {
  const app = createApp();

  const studentAuth = { Authorization: "Bearer student-token" };
  const adminAuth = {
    Authorization: "Bearer admin-token",
    "x-mock-role": "admin",
  };

  describe("Shared Session Checklist (PRD FR-CHECK-01–08)", () => {
    it("GET /api/rooms/:id/checklist returns items in creation order (oldest first)", async () => {
      const res = await request(app).get("/api/rooms/dev-room-1/checklist");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);
      expect(res.body.items[0].id).toBe("check-1");
    });

    it("POST /api/rooms/:id/checklist adds a milestone to an open room", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-1/checklist")
        .set(studentAuth)
        .send({ title: "Solve Tutorial 5 Question 2" });

      expect(res.status).toBe(201);
      expect(res.body.item).toBeDefined();
      expect(res.body.item.title).toBe("Solve Tutorial 5 Question 2");
      expect(res.body.item.is_completed).toBe(false);
    });

    it("POST /api/rooms/:id/checklist rejects adding item to a closed room (PRD FR-CHECK-08)", async () => {
      const res = await request(app)
        .post("/api/rooms/dev-room-closed/checklist")
        .set(studentAuth)
        .send({ title: "Late item" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("closed");
    });

    it("PATCH /api/rooms/:id/checklist/:itemId allows marking complete", async () => {
      const res = await request(app)
        .patch("/api/rooms/dev-room-1/checklist/check-1")
        .set(studentAuth)
        .send({ is_completed: true });

      expect(res.status).toBe(200);
      expect(res.body.item.is_completed).toBe(true);
    });

    it("PATCH /api/rooms/:id/checklist/:itemId rejects editing item in a closed room", async () => {
      const res = await request(app)
        .patch("/api/rooms/dev-room-closed/checklist/check-closed-1")
        .set(studentAuth)
        .send({ is_completed: false });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("read-only");
    });

    it("DELETE /api/rooms/:id/checklist/:itemId allows admin to delete any item", async () => {
      const res = await request(app)
        .delete("/api/rooms/dev-room-1/checklist/check-2")
        .set(adminAuth);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted");
    });
  });

  describe("Module Group Forum (PRD FR-FORUM-01–08)", () => {
    let createdPostId = "";

    it("GET /api/modules/:moduleId/forum lists posts with pinned announcement first", async () => {
      const res = await request(app).get("/api/modules/mod-1/forum");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body.posts.length).toBeGreaterThan(0);
      expect(res.body.posts[0].is_pinned).toBe(true);
    });

    it("POST /api/modules/:moduleId/forum creates a text post", async () => {
      const res = await request(app)
        .post("/api/modules/mod-1/forum")
        .set(studentAuth)
        .send({ content: "Study group tonight at 19:00 SAST" });

      expect(res.status).toBe(201);
      expect(res.body.post).toBeDefined();
      expect(res.body.post.content).toBe("Study group tonight at 19:00 SAST");
      expect(res.body.post.edited_at).toBeNull();
      createdPostId = res.body.post.id;
    });

    it("PATCH /api/modules/:moduleId/forum/:postId allows author to edit own post (PRD FR-FORUM-07)", async () => {
      const res = await request(app)
        .patch(`/api/modules/mod-1/forum/${createdPostId}`)
        .set(studentAuth)
        .send({ content: "Study group tonight at 19:30 SAST (updated)" });

      expect(res.status).toBe(200);
      expect(res.body.post.content).toContain("(updated)");
      expect(res.body.post.edited_at).toBeDefined();
    });

    it("POST /api/modules/:moduleId/forum/:postId/pin allows admin to pin an announcement (PRD FR-FORUM-04)", async () => {
      const res = await request(app)
        .post(`/api/modules/mod-1/forum/${createdPostId}/pin`)
        .set(adminAuth)
        .send({ is_pinned: true });

      expect(res.status).toBe(200);
      expect(res.body.post.is_pinned).toBe(true);
    });

    it("POST /api/modules/:moduleId/forum/:postId/pin rejects non-admin pinning", async () => {
      const res = await request(app)
        .post(`/api/modules/mod-1/forum/${createdPostId}/pin`)
        .set(studentAuth)
        .send({ is_pinned: false });

      expect(res.status).toBe(403);
    });

    it("DELETE /api/modules/:moduleId/forum/:postId allows admin to remove any post (PRD FR-FORUM-08)", async () => {
      const res = await request(app)
        .delete(`/api/modules/mod-1/forum/${createdPostId}`)
        .set(adminAuth);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted");
    });
  });
});
