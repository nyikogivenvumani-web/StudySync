import type { ForumPost as ApiForumPost } from "../../lib/api.js";

export type ForumPost = {
  id: string;
  moduleId: string;
  moduleCode: string;
  author: string;
  age: string;
  body: string;
  edited?: boolean;
  pinned?: boolean;
  ownedByCurrentUser?: boolean;
};

export function formatAge(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function toDisplayPost(
  post: ApiForumPost,
  moduleCode: string,
  currentUserId: string,
): ForumPost {
  const isMine = post.author_id === currentUserId;
  const name = post.profiles?.full_name || post.author_name || "Student";
  return {
    id: post.id,
    moduleId: post.module_id,
    moduleCode,
    author: isMine ? `${name} (You)` : name,
    age: formatAge(post.created_at),
    body: post.content,
    edited: Boolean(post.edited_at),
    pinned: post.is_pinned,
    ownedByCurrentUser: isMine,
  };
}
