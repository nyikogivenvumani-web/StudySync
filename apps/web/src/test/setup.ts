import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// In test environment, mock Supabase as null to verify unconnected / fallback flows
vi.mock("../lib/supabase.js", () => ({
  supabase: null,
}));

// Mock Daily.co in jsdom test environment to avoid canvas/WebRTC initialization
vi.mock("@daily-co/daily-js", () => ({
  default: {
    createCallObject: vi.fn(() => ({
      on: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      participants: vi.fn(() => ({})),
      setLocalVideo: vi.fn(),
    })),
  },
}));
