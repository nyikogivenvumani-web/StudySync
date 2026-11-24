import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Institutions & Modules Endpoints", () => {
  const app = createApp();

  it("GET /api/institutions returns supported institution types (College & University)", async () => {
    const res = await request(app).get("/api/institutions");
    expect(res.status).toBe(200);
    expect(res.body.institutionTypes).toBeDefined();
    expect(res.body.institutionTypes.map((t: { id: string }) => t.id)).toEqual([
      "University",
      "College",
    ]);
  });

  it("GET /api/modules returns modules list", async () => {
    const res = await request(app).get("/api/modules");
    expect(res.status).toBe(200);
    expect(res.body.modules).toBeDefined();
    expect(Array.isArray(res.body.modules)).toBe(true);
  });

  it("GET /api/modules?institution_type=College filters modules by College", async () => {
    const res = await request(app).get("/api/modules?institution_type=College");
    expect(res.status).toBe(200);
    const collegeModules = res.body.modules;
    expect(collegeModules.length).toBeGreaterThan(0);
    expect(collegeModules.every((m: { institution_type: string }) => m.institution_type === "College")).toBe(true);
  });

  it("POST /api/modules/requests rejects missing authorization header", async () => {
    const res = await request(app)
      .post("/api/modules/requests")
      .send({ code: "TEST101" });
    expect(res.status).toBe(401);
  });
});
