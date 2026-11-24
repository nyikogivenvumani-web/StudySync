import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin, supabasePublic } from "../config/supabase.js";
import type { AuthenticatedUser, UserRole } from "../types/auth.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    // Development fallback mock if Supabase credentials are not yet configured
    if (process.env.NODE_ENV !== "production") {
      req.user = {
        id: "mock-user-id",
        email: "student@studysync.local",
        role: (req.headers["x-mock-role"] as UserRole) || "student",
      };
      next();
      return;
    }
    res.status(500).json({ error: "Supabase client is not configured" });
    return;
  }

  const { data: { user }, error } = await client.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // Fetch user role and institution_type from the profiles table
  const { data: profile } = await client
    .from("profiles")
    .select("role, institution_type")
    .eq("id", user.id)
    .single();

  const userRole: UserRole = profile?.role === "admin" ? "admin" : "student";

  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    role: userRole,
    institution_type: profile?.institution_type ?? null,
  };

  req.user = authenticatedUser;
  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admin access required" });
    return;
  }

  next();
}
