import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// In test environment, mock Supabase as null to verify unconnected / fallback flows
vi.mock("../lib/supabase.js", () => ({
  supabase: null,
}));
