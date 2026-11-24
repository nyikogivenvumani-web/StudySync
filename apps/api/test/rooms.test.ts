import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Room Management & Capacity Enforcement", () => {
  const app = createApp();

  const studentAuth = { Authorization: "Bearer student-token" };
  const adminAuth = {
    Authorization: "Bearer admin-token",
    "x-mock-role": "admin",
  };

  it("GET /api/rooms returns openRooms and closedRooms", async () => {
    const res = await request(app).get("/api/rooms");
    expect(res.status).toBe(200);
    expect(res.body.openRooms).toBeDefined();
    expect(res.body.closedRooms).toBeDefined();
    expect(Array.isArray(res.body.openRooms)).toBe(true);
    expect(Array.isArray(res.body.closedRooms)).toBe(true);
  });

  it("GET /api/rooms/:id returns room details with occupancy and capacity limit", async () => {
    const res = await request(app).get("/api/rooms/dev-room-1");
    expect(res.status).toBe(200);
    expect(res.body.room).toBeDefined();
    expect(res.body.room.id).toBe("dev-room-1");
    expect(res.body.room.max_participants).toBe(20);
    expect(res.body.room.occupancy).toBeDefined();
    expect(typeof res.body.room.is_full).toBe("boolean");
  });

  it("POST /api/rooms fails for non-admin users (PRD FR-ROOM-09)", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .set(studentAuth)
      .send({ module_id: "mod-1", title: "Student Room" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Admin access required");
  });

  it("POST /api/rooms allows admin to create a new room", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .set(adminAuth)
      .send({ module_id: "mod-1", title: "New Admin Study Room" });

    expect(res.status).toBe(201);
    expect(res.body.room).toBeDefined();
    expect(res.body.room.title).toBe("New Admin Study Room");
    expect(res.body.room.status).toBe("open");
  });

  it("POST /api/rooms/:id/join allows student to join open room with available seats", async () => {
    const res = await request(app)
      .post("/api/rooms/dev-room-1/join")
      .set(studentAuth);

    expect(res.status).toBe(200);
    expect(res.body.occupancy).toBeDefined();
    expect(res.body.max_participants).toBe(20);
  });

  it("POST /api/rooms/:id/join rejects participant when room is at 20/20 capacity (PRD FR-ROOM-02, FR-ROOM-03)", async () => {
    const res = await request(app)
      .post("/api/rooms/dev-room-full/join")
      .set({
        Authorization: "Bearer newcomer-token",
        "x-mock-role": "student",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("capacity");
    expect(res.body.occupancy).toBe(20);
    expect(res.body.max_participants).toBe(20);
  });

  it("POST /api/rooms/:id/join rejects joining a closed room", async () => {
    const res = await request(app)
      .post("/api/rooms/dev-room-closed/join")
      .set(studentAuth);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("closed");
  });

  it("POST /api/rooms/:id/close allows admin to close a room (PRD FR-ROOM-11)", async () => {
    const res = await request(app)
      .post("/api/rooms/dev-room-1/close")
      .set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.room.status).toBe("closed");
  });

  it("POST /api/rooms/:id/leave allows a participant to leave and release seat", async () => {
    const res = await request(app)
      .post("/api/rooms/dev-room-1/leave")
      .set(studentAuth);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Left room");
  });
});
