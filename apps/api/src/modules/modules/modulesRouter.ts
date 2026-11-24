import { Router, type Request, type Response } from "express";
import { supabaseAdmin, supabasePublic } from "../../config/supabase.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

export const institutionsRouter = Router();

// GET /api/institutions - Returns supported institution types for MVP (PRD v1.4)
institutionsRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    institutionTypes: [
      { id: "University", name: "University", description: "Public and private universities" },
      { id: "College", name: "College", description: "TVET and registered colleges" },
    ],
  });
});

export const modulesRouter = Router();

// GET /api/modules - List active modules (filterable by institution_type)
modulesRouter.get("/", async (req: Request, res: Response) => {
  const institutionType = req.query.institution_type as string | undefined;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    // In-memory fallback for local preview/testing without Supabase credentials
    const fallbackModules = [
      { code: "MAT2611", title: "Linear Algebra II & Matrix Methods", subject: "Mathematics", institution_type: "University" },
      { code: "COS1511", title: "Introduction to Programming I", subject: "Computer Science", institution_type: "University" },
      { code: "ECS1501", title: "Economics IA: Microeconomics", subject: "Economics", institution_type: "University" },
      { code: "ENG1501", title: "Foundations in English Literary Studies", subject: "English", institution_type: "College" },
    ];
    const filtered = institutionType
      ? fallbackModules.filter(m => m.institution_type === institutionType)
      : fallbackModules;
    res.json({ modules: filtered });
    return;
  }

  let query = client
    .from("modules")
    .select("id, code, title, subject, institution_type, is_archived, created_at")
    .eq("is_archived", false);

  if (institutionType) {
    query = query.eq("institution_type", institutionType);
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ modules: data });
});

// POST /api/modules/requests - Student requests a missing module (PRD FR-MOD-07)
modulesRouter.post("/requests", requireAuth, async (req: Request, res: Response) => {
  const { code, title, institution_type } = req.body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "Module code is required" });
    return;
  }

  const client = supabaseAdmin || supabasePublic;
  if (!client) {
    res.status(201).json({
      message: "Module request submitted successfully (dev mode)",
      request: {
        code: code.trim().toUpperCase(),
        title: title || "",
        institution_type: institution_type || "University",
        status: "pending",
      },
    });
    return;
  }

  const { data, error } = await client
    .from("module_requests")
    .insert({
      user_id: req.user!.id,
      code: code.trim().toUpperCase(),
      title: title ? title.trim() : null,
      institution_type: institution_type === "College" ? "College" : "University",
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ message: "Module request submitted", request: data });
});

// Admin-only module management: POST /api/modules (Create)
modulesRouter.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { code, title, subject, institution_type } = req.body;

  if (!code || !title || !subject) {
    res.status(400).json({ error: "Code, title, and subject are required" });
    return;
  }

  const client = supabaseAdmin || supabasePublic;
  if (!client) {
    res.status(201).json({ message: "Module created (dev mode)", module: req.body });
    return;
  }

  const { data, error } = await client
    .from("modules")
    .insert({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      subject: subject.trim(),
      institution_type: institution_type === "College" ? "College" : "University",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ module: data });
});
