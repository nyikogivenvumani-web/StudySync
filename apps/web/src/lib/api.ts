import { supabase } from "./supabase.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function getAuthHeader(): Promise<Record<string, string>> {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  }
  // Fallback for development preview when Supabase is not connected
  return { Authorization: "Bearer dev-token" };
}

export type ModuleOption = {
  id?: string;
  code: string;
  title: string;
  subject: string;
  institution_type: "College" | "University";
  peers?: number;
};

export type RoomItem = {
  id: string;
  module_id: string;
  module_code?: string;
  module_title?: string;
  title: string;
  status: "open" | "closed";
  created_by: string;
  created_at: string;
  closed_at?: string | null;
  occupancy: number;
  max_participants: number;
  is_full: boolean;
};

export type TimerState = {
  room_id: string;
  phase: "focus" | "break";
  phase_duration_minutes: number;
  phase_end_at: string | null;
  is_running: boolean;
};

export type StatusTag = {
  user_id: string;
  status: string;
  profiles?: { id: string; full_name: string | null } | null;
};

export type ChecklistItem = {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  is_completed: boolean;
  created_at: string;
  profiles?: { id: string; full_name: string | null } | null;
};

export type ForumPost = {
  id: string;
  module_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  is_pinned: boolean;
  edited_at: string | null;
  created_at: string;
  profiles?: { id: string; full_name: string | null } | null;
};

// --- Institutions & Modules ---

export async function fetchInstitutions(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE}/api/institutions`);
  if (!res.ok) throw new Error("Failed to fetch institutions");
  const data = await res.json();
  return data.institutionTypes || [];
}

export async function fetchModules(institutionType?: string): Promise<ModuleOption[]> {
  const url = institutionType
    ? `${API_BASE}/api/modules?institution_type=${encodeURIComponent(institutionType)}`
    : `${API_BASE}/api/modules`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch modules");
  const data = await res.json();
  return data.modules || [];
}

export async function submitModuleRequest(params: {
  code: string;
  title?: string;
  institution_type: string;
}): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/modules/requests`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit module request");
  }
}

// --- Rooms ---

export async function fetchRooms(moduleId?: string): Promise<{
  openRooms: RoomItem[];
  closedRooms: RoomItem[];
}> {
  const url = moduleId
    ? `${API_BASE}/api/rooms?module_id=${encodeURIComponent(moduleId)}`
    : `${API_BASE}/api/rooms`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

export async function fetchRoomDetails(roomId: string): Promise<RoomItem> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}`);
  if (!res.ok) throw new Error("Failed to fetch room details");
  const data = await res.json();
  return data.room;
}

export async function joinRoom(roomId: string): Promise<{ occupancy: number }> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/join`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to join room");
  }
  return res.json();
}

export async function leaveRoom(roomId: string): Promise<void> {
  const headers = await getAuthHeader();
  await fetch(`${API_BASE}/api/rooms/${roomId}/leave`, {
    method: "POST",
    headers,
  });
}

export async function closeRoom(roomId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/close`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to close room");
}

// --- Timer & Status ---

export async function fetchRoomTimer(roomId: string): Promise<TimerState> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/timer`);
  if (!res.ok) throw new Error("Failed to fetch timer");
  const data = await res.json();
  return data.timer;
}

export async function controlRoomTimer(
  roomId: string,
  action: "start" | "pause" | "reset" | "advance"
): Promise<TimerState> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/timer`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to control timer");
  const data = await res.json();
  return data.timer;
}

export async function fetchRoomStatuses(roomId: string): Promise<StatusTag[]> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/status`);
  if (!res.ok) throw new Error("Failed to fetch statuses");
  const data = await res.json();
  return data.statuses || [];
}

export async function updateStudyStatus(roomId: string, status: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/status`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update study status");
  }
}

// --- Checklist ---

export async function fetchChecklist(roomId: string): Promise<ChecklistItem[]> {
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/checklist`);
  if (!res.ok) throw new Error("Failed to fetch checklist");
  const data = await res.json();
  return data.items || [];
}

export async function addChecklistItem(roomId: string, title: string): Promise<ChecklistItem> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/checklist`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add checklist item");
  }
  const data = await res.json();
  return data.item;
}

export async function toggleChecklistItem(
  roomId: string,
  itemId: string,
  is_completed: boolean
): Promise<ChecklistItem> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/checklist/${itemId}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ is_completed }),
  });
  if (!res.ok) throw new Error("Failed to update item");
  const data = await res.json();
  return data.item;
}

// --- Forum ---

export async function fetchForumPosts(moduleId: string): Promise<ForumPost[]> {
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/forum`);
  if (!res.ok) throw new Error("Failed to fetch forum posts");
  const data = await res.json();
  return data.posts || [];
}

export async function createForumPost(moduleId: string, content: string): Promise<ForumPost> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/forum`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create forum post");
  }
  const data = await res.json();
  return data.post;
}

export async function pinForumPost(
  moduleId: string,
  postId: string,
  is_pinned: boolean
): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/forum/${postId}/pin`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ is_pinned }),
  });
  if (!res.ok) throw new Error("Failed to update post pin status");
}

export async function deleteForumPost(moduleId: string, postId: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/modules/${moduleId}/forum/${postId}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete post");
}

// --- Video (Daily.co) ---

export async function fetchVideoToken(
  roomId: string
): Promise<{ token: string; roomUrl: string }> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/rooms/${roomId}/video-token`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to get video token");
  }
  return res.json();
}
