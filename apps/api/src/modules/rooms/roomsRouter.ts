import { Router, type Request, type Response } from "express";
import { supabaseAdmin, supabasePublic } from "../../config/supabase.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";

export const roomsRouter = Router();

const MAX_PARTICIPANTS = 20;

// In-memory fallback state for development/testing when Supabase is not connected
type DevRoom = {
  id: string;
  module_id: string;
  module_code: string;
  title: string;
  status: "open" | "closed";
  created_by: string;
  created_at: string;
  participants: Set<string>;
};

type DevTimer = {
  room_id: string;
  phase: "focus" | "break";
  phase_duration_minutes: number;
  phase_end_at: string | null;
  is_running: boolean;
};

const devTimers: Map<string, DevTimer> = new Map([
  [
    "dev-room-1",
    {
      room_id: "dev-room-1",
      phase: "focus",
      phase_duration_minutes: 50,
      phase_end_at: null,
      is_running: false,
    },
  ],
]);

const devStatuses: Map<string, Map<string, string>> = new Map([
  [
    "dev-room-1",
    new Map([
      ["user-1", "Chapter 1 – Differential Equations"],
      ["user-2", "Reviewing Lecture 4 slides"],
    ]),
  ],
]);

type DevChecklistItem = {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

const devChecklists: Map<string, DevChecklistItem[]> = new Map([
  [
    "dev-room-1",
    [
      {
        id: "check-1",
        room_id: "dev-room-1",
        created_by: "user-1",
        title: "Complete Exercise 3.1",
        is_completed: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "check-2",
        room_id: "dev-room-1",
        created_by: "user-2",
        title: "Review Theorem 2.4 proof",
        is_completed: true,
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  ],
  [
    "dev-room-closed",
    [
      {
        id: "check-closed-1",
        room_id: "dev-room-closed",
        created_by: "user-1",
        title: "Finished past paper 2024",
        is_completed: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  ],
]);

const devRooms: Map<string, DevRoom> = new Map([
  [
    "dev-room-1",
    {
      id: "dev-room-1",
      module_id: "mod-1",
      module_code: "MAT2611",
      title: "MAT2611 Silent Study",
      status: "open",
      created_by: "admin-1",
      created_at: new Date().toISOString(),
      participants: new Set<string>(["user-1", "user-2"]),
    },
  ],
  [
    "dev-room-full",
    {
      id: "dev-room-full",
      module_id: "mod-2",
      module_code: "COS1511",
      title: "COS1511 Full Room",
      status: "open",
      created_by: "admin-1",
      created_at: new Date().toISOString(),
      participants: new Set<string>(
        Array.from({ length: 20 }, (_, i) => `user-full-${i + 1}`)
      ),
    },
  ],
  [
    "dev-room-closed",
    {
      id: "dev-room-closed",
      module_id: "mod-1",
      module_code: "MAT2611",
      title: "MAT2611 Yesterday Session",
      status: "closed",
      created_by: "admin-1",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      participants: new Set<string>(),
    },
  ],
]);

// GET /api/rooms - List discoverable rooms
// Filterable by module_id or student's modules.
// Returns open rooms and closed rooms (for viewing checklists).
roomsRouter.get("/", async (req: Request, res: Response) => {
  const moduleId = req.query.module_id as string | undefined;
  const statusFilter = req.query.status as string | undefined;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    let list = Array.from(devRooms.values()).map((r) => ({
      id: r.id,
      module_id: r.module_id,
      module_code: r.module_code,
      title: r.title,
      status: r.status,
      created_by: r.created_by,
      created_at: r.created_at,
      occupancy: r.participants.size,
      max_participants: MAX_PARTICIPANTS,
      is_full: r.participants.size >= MAX_PARTICIPANTS,
    }));

    if (moduleId) {
      list = list.filter((r) => r.module_id === moduleId || r.module_code === moduleId);
    }
    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
    }

    res.json({
      openRooms: list.filter((r) => r.status === "open"),
      closedRooms: list.filter((r) => r.status === "closed"),
    });
    return;
  }

  try {
    let query = client
      .from("rooms")
      .select(`
        id,
        module_id,
        title,
        status,
        created_by,
        created_at,
        closed_at,
        modules ( id, code, title ),
        room_participants ( user_id )
      `);

    if (moduleId) {
      query = query.eq("module_id", moduleId);
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    type SupabaseRoomRow = {
      id: string;
      module_id: string;
      title: string;
      status: "open" | "closed";
      created_by: string;
      created_at: string;
      closed_at: string | null;
      modules?: { id: string; code: string; title: string } | null;
      room_participants?: Array<{ user_id: string }> | null;
    };

    const formatted = ((data || []) as unknown as SupabaseRoomRow[]).map((r) => {
      const participantsCount = Array.isArray(r.room_participants)
        ? r.room_participants.length
        : 0;
      return {
        id: r.id,
        module_id: r.module_id,
        module_code: r.modules?.code,
        module_title: r.modules?.title,
        title: r.title,
        status: r.status,
        created_by: r.created_by,
        created_at: r.created_at,
        closed_at: r.closed_at,
        occupancy: participantsCount,
        max_participants: MAX_PARTICIPANTS,
        is_full: participantsCount >= MAX_PARTICIPANTS,
      };
    });

    res.json({
      openRooms: formatted.filter((r) => r.status === "open"),
      closedRooms: formatted.filter((r) => r.status === "closed"),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch rooms";
    res.status(500).json({ error: message });
  }
});

// GET /api/rooms/:id - Get room details
roomsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json({
      room: {
        ...room,
        occupancy: room.participants.size,
        max_participants: MAX_PARTICIPANTS,
        is_full: room.participants.size >= MAX_PARTICIPANTS,
      },
    });
    return;
  }

  const { data, error } = await client
    .from("rooms")
    .select(`
      id,
      module_id,
      title,
      status,
      created_by,
      created_at,
      closed_at,
      modules ( id, code, title ),
      room_participants ( user_id )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const occupancy = Array.isArray(data.room_participants)
    ? data.room_participants.length
    : 0;

  res.json({
    room: {
      ...data,
      occupancy,
      max_participants: MAX_PARTICIPANTS,
      is_full: occupancy >= MAX_PARTICIPANTS,
    },
  });
});

// POST /api/rooms - Admin-only room creation (PRD FR-ROOM-09)
roomsRouter.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { module_id, title } = req.body;

  if (!module_id) {
    res.status(400).json({ error: "module_id is required" });
    return;
  }

  const roomTitle = title?.trim() || "Silent Study Session";
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const newId = `dev-room-${Date.now()}`;
    const newRoom: DevRoom = {
      id: newId,
      module_id,
      module_code: req.body.module_code || "GENERIC",
      title: roomTitle,
      status: "open",
      created_by: req.user!.id,
      created_at: new Date().toISOString(),
      participants: new Set<string>(),
    };
    devRooms.set(newId, newRoom);
    res.status(201).json({ room: newRoom });
    return;
  }

  const { data: room, error: roomError } = await client
    .from("rooms")
    .insert({
      module_id,
      title: roomTitle,
      created_by: req.user!.id,
      status: "open",
    })
    .select()
    .single();

  if (roomError) {
    res.status(500).json({ error: roomError.message });
    return;
  }

  // Also initialize the synchronized timer record (50 min focus)
  await client.from("room_timers").insert({
    room_id: room.id,
    phase: "focus",
    phase_duration_minutes: 50,
    is_running: false,
  });

  res.status(201).json({ room });
});

// POST /api/rooms/:id/close - Admin-only room closing (PRD FR-ROOM-11)
roomsRouter.post("/:id/close", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    room.status = "closed";
    res.json({ message: "Room closed successfully", room });
    return;
  }

  const { data, error } = await client
    .from("rooms")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: "Room closed successfully", room: data });
});

// POST /api/rooms/:id/join - Join room with authoritative 20-seat capacity enforcement
// PRD FR-ROOM-02, FR-ROOM-03
roomsRouter.post("/:id/join", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    if (room.status !== "open") {
      res.status(400).json({ error: "Cannot join a closed room" });
      return;
    }

    // Already a participant? Return success
    if (room.participants.has(userId)) {
      res.json({
        message: "Already joined",
        occupancy: room.participants.size,
        max_participants: MAX_PARTICIPANTS,
      });
      return;
    }

    // Capacity check
    if (room.participants.size >= MAX_PARTICIPANTS) {
      res.status(409).json({
        error: "Room is at capacity (20/20 participants)",
        occupancy: room.participants.size,
        max_participants: MAX_PARTICIPANTS,
      });
      return;
    }

    room.participants.add(userId);
    res.json({
      message: "Joined room successfully",
      occupancy: room.participants.size,
      max_participants: MAX_PARTICIPANTS,
    });
    return;
  }

  // Check room status first
  const { data: room, error: roomErr } = await client
    .from("rooms")
    .select("id, status")
    .eq("id", id)
    .single();

  if (roomErr || !room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.status !== "open") {
    res.status(400).json({ error: "Cannot join a closed room" });
    return;
  }

  // Check current participant count and if user is already inside
  const { data: participants, error: partErr } = await client
    .from("room_participants")
    .select("user_id")
    .eq("room_id", id);

  if (partErr) {
    res.status(500).json({ error: partErr.message });
    return;
  }

  const currentCount = participants ? participants.length : 0;
  const isAlreadyJoined = participants?.some((p) => p.user_id === userId);

  if (isAlreadyJoined) {
    res.json({
      message: "Already joined",
      occupancy: currentCount,
      max_participants: MAX_PARTICIPANTS,
    });
    return;
  }

  // Hard 20 capacity check
  if (currentCount >= MAX_PARTICIPANTS) {
    res.status(409).json({
      error: "Room is at capacity (20/20 participants)",
      occupancy: currentCount,
      max_participants: MAX_PARTICIPANTS,
    });
    return;
  }

  // Insert participant record
  const { error: insertErr } = await client.from("room_participants").insert({
    room_id: id,
    user_id: userId,
  });

  if (insertErr) {
    res.status(500).json({ error: insertErr.message });
    return;
  }

  res.json({
    message: "Joined room successfully",
    occupancy: currentCount + 1,
    max_participants: MAX_PARTICIPANTS,
  });
});

// POST /api/rooms/:id/leave - Leave room and release seat
roomsRouter.post("/:id/leave", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (room) {
      room.participants.delete(userId);
    }
    res.json({ message: "Left room successfully" });
    return;
  }

  const { error } = await client
    .from("room_participants")
    .delete()
    .eq("room_id", id)
    .eq("user_id", userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: "Left room successfully" });
});

// GET /api/rooms/:id/timer - Fetch synchronized timer state
// PRD FR-TIMER-01, FR-TIMER-02, FR-TIMER-03, FR-TIMER-04
roomsRouter.get("/:id/timer", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    let timer = devTimers.get(id);
    if (!timer) {
      timer = {
        room_id: id,
        phase: "focus",
        phase_duration_minutes: 50,
        phase_end_at: null,
        is_running: false,
      };
      devTimers.set(id, timer);
    }
    res.json({ timer });
    return;
  }

  const { data: timer, error } = await client
    .from("room_timers")
    .select("room_id, phase, phase_duration_minutes, phase_end_at, is_running, updated_at")
    .eq("room_id", id)
    .single();

  if (error || !timer) {
    res.status(404).json({ error: "Timer not found for this room" });
    return;
  }

  res.json({ timer });
});

// POST /api/rooms/:id/timer - Admin controls timer (start, pause, reset, advance)
// PRD FR-TIMER-05: Timer controls available only to admin; participants read-only.
roomsRouter.post("/:id/timer", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { action, phase, duration_minutes } = req.body;

  if (!action || !["start", "pause", "reset", "advance"].includes(action)) {
    res.status(400).json({ error: "Invalid action. Must be start, pause, reset, or advance." });
    return;
  }

  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    let timer = devTimers.get(id);
    if (!timer) {
      timer = {
        room_id: id,
        phase: "focus",
        phase_duration_minutes: 50,
        phase_end_at: null,
        is_running: false,
      };
      devTimers.set(id, timer);
    }

    if (action === "start") {
      const duration = duration_minutes || timer.phase_duration_minutes || 50;
      timer.phase_duration_minutes = duration;
      timer.is_running = true;
      timer.phase_end_at = new Date(Date.now() + duration * 60 * 1000).toISOString();
    } else if (action === "pause") {
      timer.is_running = false;
      timer.phase_end_at = null;
    } else if (action === "reset") {
      timer.phase = "focus";
      timer.phase_duration_minutes = 50;
      timer.is_running = false;
      timer.phase_end_at = null;
    } else if (action === "advance") {
      const nextPhase = timer.phase === "focus" ? "break" : "focus";
      const nextDuration = nextPhase === "break" ? 10 : 50;
      timer.phase = nextPhase;
      timer.phase_duration_minutes = nextDuration;
      timer.is_running = true;
      timer.phase_end_at = new Date(Date.now() + nextDuration * 60 * 1000).toISOString();
    }

    res.json({ message: `Timer action ${action} executed`, timer });
    return;
  }

  const { data: currentTimer, error: fetchErr } = await client
    .from("room_timers")
    .select("*")
    .eq("room_id", id)
    .single();

  if (fetchErr || !currentTimer) {
    res.status(404).json({ error: "Timer not found for this room" });
    return;
  }

  let nextPhase = currentTimer.phase;
  let nextDuration = currentTimer.phase_duration_minutes;
  let nextIsRunning = currentTimer.is_running;
  let nextEndAt = currentTimer.phase_end_at;

  if (action === "start") {
    nextDuration = duration_minutes || (phase === "break" ? 10 : 50);
    nextPhase = phase || nextPhase;
    nextIsRunning = true;
    nextEndAt = new Date(Date.now() + nextDuration * 60 * 1000).toISOString();
  } else if (action === "pause") {
    nextIsRunning = false;
    nextEndAt = null;
  } else if (action === "reset") {
    nextPhase = "focus";
    nextDuration = 50;
    nextIsRunning = false;
    nextEndAt = null;
  } else if (action === "advance") {
    nextPhase = currentTimer.phase === "focus" ? "break" : "focus";
    nextDuration = nextPhase === "break" ? 10 : 50;
    nextIsRunning = true;
    nextEndAt = new Date(Date.now() + nextDuration * 60 * 1000).toISOString();
  }

  const { data: updatedTimer, error: updateErr } = await client
    .from("room_timers")
    .update({
      phase: nextPhase,
      phase_duration_minutes: nextDuration,
      is_running: nextIsRunning,
      phase_end_at: nextEndAt,
      updated_at: new Date().toISOString(),
    })
    .eq("room_id", id)
    .select()
    .single();

  if (updateErr) {
    res.status(500).json({ error: updateErr.message });
    return;
  }

  res.json({ message: `Timer action ${action} executed`, timer: updatedTimer });
});

// GET /api/rooms/:id/status - Fetch study statuses of all active participants
// PRD FR-STATUS-02: Room participants can see each other's status tags
roomsRouter.get("/:id/status", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const statusesMap = devStatuses.get(id);
    const statuses = statusesMap
      ? Array.from(statusesMap.entries()).map(([userId, status]) => ({
          user_id: userId,
          status,
        }))
      : [];
    res.json({ statuses });
    return;
  }

  const { data, error } = await client
    .from("study_statuses")
    .select("user_id, status, updated_at, profiles(id, full_name)")
    .eq("room_id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ statuses: data || [] });
});

// PUT /api/rooms/:id/status - Participant updates their study status tag
// PRD FR-STATUS-01, FR-STATUS-04: Plain text of 1 to 60 characters; empty clears status.
roomsRouter.put("/:id/status", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.id;
  const rawStatus = req.body.status;

  // Trim whitespace
  const trimmed = typeof rawStatus === "string" ? rawStatus.trim() : "";

  // If empty, clear the status tag
  if (trimmed.length === 0) {
    const client = supabaseAdmin || supabasePublic;
    if (!client) {
      const roomStatuses = devStatuses.get(id);
      if (roomStatuses) {
        roomStatuses.delete(userId);
      }
      res.json({ message: "Status tag cleared", status: null });
      return;
    }

    await client
      .from("study_statuses")
      .delete()
      .eq("room_id", id)
      .eq("user_id", userId);

    res.json({ message: "Status tag cleared", status: null });
    return;
  }

  // Validate length 1 to 60 characters (PRD FR-STATUS-04)
  if (trimmed.length > 60) {
    res.status(400).json({
      error: "Status tag must be between 1 and 60 characters after trimming whitespace.",
    });
    return;
  }

  const client = supabaseAdmin || supabasePublic;
  if (!client) {
    let roomStatuses = devStatuses.get(id);
    if (!roomStatuses) {
      roomStatuses = new Map();
      devStatuses.set(id, roomStatuses);
    }
    roomStatuses.set(userId, trimmed);
    res.json({ message: "Status tag updated", status: trimmed });
    return;
  }

  // Upsert the status tag
  const { data, error } = await client
    .from("study_statuses")
    .upsert({
      room_id: id,
      user_id: userId,
      status: trimmed,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: "Status tag updated", status: data.status });
});

// GET /api/rooms/:id/checklist - Get shared checklist items in creation order
// PRD FR-CHECK-01, FR-CHECK-07, FR-CHECK-08
roomsRouter.get("/:id/checklist", async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const items = devChecklists.get(id) || [];
    // Always return in creation order (oldest first per PRD FR-CHECK-07)
    const sorted = [...items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    res.json({ items: sorted });
    return;
  }

  const { data, error } = await client
    .from("checklist_items")
    .select("id, room_id, created_by, title, is_completed, created_at, profiles(id, full_name)")
    .eq("room_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ items: data || [] });
});

// POST /api/rooms/:id/checklist - Add milestone item (only if room is open)
// PRD FR-CHECK-02, FR-CHECK-08
roomsRouter.post("/:id/checklist", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.id;
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Checklist item title is required" });
    return;
  }

  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (room.status !== "open") {
      res.status(400).json({ error: "Cannot add checklist items to a closed room (PRD FR-CHECK-08)" });
      return;
    }

    let items = devChecklists.get(id);
    if (!items) {
      items = [];
      devChecklists.set(id, items);
    }

    const newItem: DevChecklistItem = {
      id: `check-${Date.now()}`,
      room_id: id,
      created_by: userId,
      title: title.trim(),
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    items.push(newItem);
    res.status(201).json({ item: newItem });
    return;
  }

  // Check if room is open
  const { data: room, error: roomErr } = await client
    .from("rooms")
    .select("status")
    .eq("id", id)
    .single();

  if (roomErr || !room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.status !== "open") {
    res.status(400).json({ error: "Cannot add checklist items to a closed room" });
    return;
  }

  const { data, error } = await client
    .from("checklist_items")
    .insert({
      room_id: id,
      created_by: userId,
      title: title.trim(),
      is_completed: false,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ item: data });
});

// PATCH /api/rooms/:id/checklist/:itemId - Update item (complete/incomplete or title)
// PRD FR-CHECK-03, FR-CHECK-06, FR-CHECK-08
roomsRouter.patch("/:id/checklist/:itemId", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "admin";
  const { is_completed, title } = req.body;

  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (room.status !== "open") {
      res.status(400).json({ error: "Checklist is read-only when room is closed (PRD FR-CHECK-08)" });
      return;
    }

    const items = devChecklists.get(id) || [];
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      res.status(404).json({ error: "Checklist item not found" });
      return;
    }

    // Editing title requires creator or admin
    if (title !== undefined && item.created_by !== userId && !isAdmin) {
      res.status(403).json({ error: "Only the creator or an admin can edit item text (PRD FR-CHECK-06)" });
      return;
    }

    if (typeof is_completed === "boolean") {
      item.is_completed = is_completed;
    }
    if (title !== undefined && typeof title === "string" && title.trim().length > 0) {
      item.title = title.trim();
    }

    res.json({ item });
    return;
  }

  // Check if room is open
  const { data: room, error: roomErr } = await client
    .from("rooms")
    .select("status")
    .eq("id", id)
    .single();

  if (roomErr || !room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.status !== "open") {
    res.status(400).json({ error: "Checklist is read-only when room is closed" });
    return;
  }

  // Verify ownership if modifying title
  const { data: existingItem, error: fetchErr } = await client
    .from("checklist_items")
    .select("created_by")
    .eq("id", itemId)
    .single();

  if (fetchErr || !existingItem) {
    res.status(404).json({ error: "Checklist item not found" });
    return;
  }

  if (title !== undefined && existingItem.created_by !== userId && !isAdmin) {
    res.status(403).json({ error: "Only the creator or an admin can edit this item" });
    return;
  }

  const updates: { updated_at: string; is_completed?: boolean; title?: string } = {
    updated_at: new Date().toISOString(),
  };
  if (typeof is_completed === "boolean") {
    updates.is_completed = is_completed;
  }
  if (title !== undefined && typeof title === "string" && title.trim().length > 0) {
    updates.title = title.trim();
  }

  const { data: updatedItem, error: updateErr } = await client
    .from("checklist_items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (updateErr) {
    res.status(500).json({ error: updateErr.message });
    return;
  }

  res.json({ item: updatedItem });
});

// DELETE /api/rooms/:id/checklist/:itemId - Delete item
// PRD FR-CHECK-06, FR-CHECK-08: Creator can delete own item; admin can delete any item.
roomsRouter.delete("/:id/checklist/:itemId", requireAuth, async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "admin";

  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const room = devRooms.get(id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (room.status !== "open") {
      res.status(400).json({ error: "Checklist is read-only when room is closed (PRD FR-CHECK-08)" });
      return;
    }

    const items = devChecklists.get(id) || [];
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ error: "Checklist item not found" });
      return;
    }

    const item = items[itemIndex];
    if (item.created_by !== userId && !isAdmin) {
      res.status(403).json({ error: "Only the creator or an admin can delete this item (PRD FR-CHECK-06)" });
      return;
    }

    items.splice(itemIndex, 1);
    res.json({ message: "Checklist item deleted" });
    return;
  }

  // Check if room is open
  const { data: room, error: roomErr } = await client
    .from("rooms")
    .select("status")
    .eq("id", id)
    .single();

  if (roomErr || !room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.status !== "open") {
    res.status(400).json({ error: "Checklist is read-only when room is closed" });
    return;
  }

  const { data: existingItem, error: fetchErr } = await client
    .from("checklist_items")
    .select("created_by")
    .eq("id", itemId)
    .single();

  if (fetchErr || !existingItem) {
    res.status(404).json({ error: "Checklist item not found" });
    return;
  }

  if (existingItem.created_by !== userId && !isAdmin) {
    res.status(403).json({ error: "Only the creator or an admin can delete this item" });
    return;
  }

  const { error: deleteErr } = await client
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (deleteErr) {
    res.status(500).json({ error: deleteErr.message });
    return;
  }

  res.json({ message: "Checklist item deleted" });
});


