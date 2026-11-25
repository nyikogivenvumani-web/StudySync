import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ role: "student" as "student" | "admin" }));

vi.mock("./lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "u1" }, access_token: "t" } },
      }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

const modules = [
  { id: "m1", code: "MAT2611", title: "Linear Algebra", subject: "Mathematics", institution_type: "University" },
  { id: "m2", code: "COS1511", title: "Programming I", subject: "Computer Science", institution_type: "University" },
];
const room = {
  id: "r1", module_id: "m1", module_code: "MAT2611", title: "Linear Algebra room",
  status: "open", created_by: "a", created_at: "2026-01-01T00:00:00Z",
  occupancy: 3, max_participants: 20, is_full: false,
};
const closedRoom = { ...room, id: "r2", status: "closed", title: "Old room" };

vi.mock("./lib/api.js", () => ({
  fetchProfile: vi.fn(async () => ({ id: "u1", email: "me@example.com", role: state.role, institution_type: "University" })),
  fetchModules: vi.fn(async () => modules),
  fetchRooms: vi.fn(async () => ({ openRooms: [room], closedRooms: [closedRoom] })),
  fetchRoomDetails: vi.fn(async (id: string) => (id === "r2" ? closedRoom : room)),
  joinRoom: vi.fn(async () => ({ occupancy: 4 })),
  leaveRoom: vi.fn(async () => undefined),
  closeRoom: vi.fn(async () => undefined),
  fetchRoomTimer: vi.fn(async () => ({ room_id: "r1", phase: "focus", phase_duration_minutes: 50, phase_end_at: null, is_running: false })),
  fetchChecklist: vi.fn(async () => [
    { id: "c1", room_id: "r1", created_by: "u1", title: "Read chapter 1", is_completed: false, created_at: "2026-01-01T00:00:00Z", profiles: { id: "u1", full_name: "Me" } },
  ]),
  addChecklistItem: vi.fn(),
  deleteChecklistItem: vi.fn(),
  toggleChecklistItem: vi.fn(async () => undefined),
  updateStudyStatus: vi.fn(async () => undefined),
  fetchVideoToken: vi.fn(async () => ({ token: "", roomUrl: "" })),
  fetchForumPosts: vi.fn(async () => [
    { id: "p1", module_id: "m1", author_id: "u2", content: "Tutorial moved to 18:00", is_pinned: true, edited_at: "2026-01-02T00:00:00Z", created_at: "2026-01-01T00:00:00Z", profiles: { id: "u2", full_name: "Admin A" } },
  ]),
  createForumPost: vi.fn(),
  editForumPost: vi.fn(),
  pinForumPost: vi.fn(async () => undefined),
  deleteForumPost: vi.fn(async () => undefined),
  submitModuleRequest: vi.fn(async () => undefined),
  createModule: vi.fn(async () => undefined),
  createRoom: vi.fn(async () => undefined),
}));

import App from "./App.js";

beforeEach(() => {
  state.role = "student";
  localStorage.setItem("studysync:modules:u1", JSON.stringify(["MAT2611"]));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("StudySync live screens", () => {
  it("shows the signed-in account and no preview controls", async () => {
    window.history.replaceState({}, "", "/discover");
    render(<App />);

    expect(await screen.findByText("me@example.com")).toBeInTheDocument();
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
  });

  it("lists live rooms for selected modules", async () => {
    window.history.replaceState({}, "", "/discover");
    render(<App />);

    expect(await screen.findByText("Linear Algebra room")).toBeInTheDocument();
    expect(screen.getByText("Old room")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Join room/ })).toBeEnabled();
  });

  it("opens a joined room and shows the live checklist", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/discover");
    render(<App />);
    await user.click(await screen.findByRole("button", { name: /Join room/ }));

    expect(await screen.findByText("Read chapter 1")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/room/r1");
  });

  it("shows closed rooms read-only", async () => {
    window.history.replaceState({}, "", "/room/r2");
    render(<App />);

    expect(await screen.findByText("This room is closed")).toBeInTheDocument();
  });

  it("saves selected modules on this device", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/profile");
    render(<App />);

    const cos = await screen.findByRole("checkbox", { name: /COS1511/ });
    await user.click(cos);
    await user.click(screen.getByRole("button", { name: "Save selections" }));

    expect(JSON.parse(localStorage.getItem("studysync:modules:u1") ?? "[]")).toContain("COS1511");
  });

  it("shows forum posts from the API with the edited label", async () => {
    window.history.replaceState({}, "", "/forum");
    render(<App />);

    expect(await screen.findByText("Tutorial moved to 18:00")).toBeInTheDocument();
    expect(screen.getByText("Edited")).toBeInTheDocument();
  });

  it("denies students access to admin routes", async () => {
    window.history.replaceState({}, "", "/admin");
    render(<App />);

    expect(await screen.findByText(/permission to access this page/i)).toBeInTheDocument();
  });

  it("lets admins manage the catalogue and close rooms", async () => {
    const user = userEvent.setup();
    state.role = "admin";
    window.history.replaceState({}, "", "/admin");
    render(<App />);

    expect(await screen.findByText("Programming I")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Rooms" }));
    await user.click(await screen.findByRole("button", { name: "Close room" }));
    await user.click(screen.getAllByRole("button", { name: "Close room" }).at(-1)!);
    const api = await import("./lib/api.js");
    await waitFor(() => expect(api.closeRoom).toHaveBeenCalledWith("r1"));
  });
});
