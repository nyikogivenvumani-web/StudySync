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
