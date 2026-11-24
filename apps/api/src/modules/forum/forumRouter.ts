import { Router, type Request, type Response } from "express";
import { supabaseAdmin, supabasePublic } from "../../config/supabase.js";
import { requireAuth } from "../../middleware/auth.js";

export const forumRouter = Router({ mergeParams: true });

type DevForumPost = {
  id: string;
  module_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_pinned: boolean;
  edited_at: string | null;
  created_at: string;
};

const devPosts: Map<string, DevForumPost[]> = new Map([
  [
    "mod-1",
    [
      {
        id: "post-pin-1",
        module_id: "mod-1",
        author_id: "admin-1",
        author_name: "Class Rep Admin",
        content: "Welcome to MAT2611! Study rooms will be hosted daily at 18:00 SAST.",
        is_pinned: true,
        edited_at: null,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "post-student-1",
        module_id: "mod-1",
        author_id: "user-1",
        author_name: "Thabo Student",
        content: "Session moved from 16:00 to 18:00 for differential equations review.",
        is_pinned: false,
        edited_at: null,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  ],
]);

// GET /api/modules/:moduleId/forum - List module forum posts
// PRD FR-FORUM-01, FR-FORUM-04, FR-FORUM-07: Pinned announcements first, text posts, edited label.
forumRouter.get("/", async (req: Request, res: Response) => {
  const moduleId = Array.isArray(req.params.moduleId)
    ? req.params.moduleId[0]
    : req.params.moduleId;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const posts = devPosts.get(moduleId) || [];
    // Sort pinned posts first, then descending by created_at
    const sorted = [...posts].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    res.json({ posts: sorted });
    return;
  }

  const { data, error } = await client
    .from("forum_posts")
    .select("id, module_id, author_id, content, is_pinned, edited_at, created_at, profiles(id, full_name)")
    .eq("module_id", moduleId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ posts: data || [] });
});

// POST /api/modules/:moduleId/forum - Create text post
// PRD FR-FORUM-02, FR-FORUM-03: Text-only post, schedule updates
forumRouter.post("/", requireAuth, async (req: Request, res: Response) => {
  const moduleId = Array.isArray(req.params.moduleId)
    ? req.params.moduleId[0]
    : req.params.moduleId;
  const userId = req.user!.id;
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "Post content cannot be empty" });
    return;
  }

  const trimmed = content.trim();
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    let posts = devPosts.get(moduleId);
    if (!posts) {
      posts = [];
      devPosts.set(moduleId, posts);
    }

    const newPost: DevForumPost = {
      id: `post-${Date.now()}`,
      module_id: moduleId,
      author_id: userId,
      author_name: req.user?.email || "Student",
      content: trimmed,
      is_pinned: false,
      edited_at: null,
      created_at: new Date().toISOString(),
    };
    posts.unshift(newPost);
    res.status(201).json({ post: newPost });
    return;
  }

  const { data, error } = await client
    .from("forum_posts")
    .insert({
      module_id: moduleId,
      author_id: userId,
      content: trimmed,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ post: data });
});

// PATCH /api/modules/:moduleId/forum/:postId - Edit own post
// PRD FR-FORUM-07: Every user can edit own post; sets edited_at to display "Edited" label.
forumRouter.patch("/:postId", requireAuth, async (req: Request, res: Response) => {
  const moduleId = Array.isArray(req.params.moduleId)
    ? req.params.moduleId[0]
    : req.params.moduleId;
  const postId = Array.isArray(req.params.postId)
    ? req.params.postId[0]
    : req.params.postId;
  const userId = req.user!.id;
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const trimmed = content.trim();
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const posts = devPosts.get(moduleId) || [];
    const post = posts.find((p) => p.id === postId);

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Only author can edit own post (PRD FR-FORUM-07)
    if (post.author_id !== userId) {
      res.status(403).json({ error: "You can only edit your own posts" });
      return;
    }

    post.content = trimmed;
    post.edited_at = new Date().toISOString();
    res.json({ post });
    return;
  }

  const { data: existingPost, error: fetchErr } = await client
    .from("forum_posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (fetchErr || !existingPost) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (existingPost.author_id !== userId) {
    res.status(403).json({ error: "You can only edit your own posts" });
    return;
  }

  const { data: updatedPost, error: updateErr } = await client
    .from("forum_posts")
    .update({
      content: trimmed,
      edited_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .select()
    .single();

  if (updateErr) {
    res.status(500).json({ error: updateErr.message });
    return;
  }

  res.json({ post: updatedPost });
});

// POST /api/modules/:moduleId/forum/:postId/pin - Admin pin/unpin announcement
// PRD FR-FORUM-04: Admins can pin announcements.
forumRouter.post("/:postId/pin", requireAuth, async (req: Request, res: Response) => {
  const moduleId = Array.isArray(req.params.moduleId)
    ? req.params.moduleId[0]
    : req.params.moduleId;
  const postId = Array.isArray(req.params.postId)
    ? req.params.postId[0]
    : req.params.postId;

  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required to pin or unpin posts" });
    return;
  }

  const { is_pinned } = req.body;
  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const posts = devPosts.get(moduleId) || [];
    const post = posts.find((p) => p.id === postId);

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    post.is_pinned = typeof is_pinned === "boolean" ? is_pinned : !post.is_pinned;
    res.json({ message: "Pin status updated", post });
    return;
  }

  const pinValue = typeof is_pinned === "boolean" ? is_pinned : true;

  const { data, error } = await client
    .from("forum_posts")
    .update({ is_pinned: pinValue })
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: "Pin status updated", post: data });
});

// DELETE /api/modules/:moduleId/forum/:postId - Admin remove any post, or author remove own
// PRD FR-FORUM-08: Admins can remove any post (spam/off-topic); author can remove own.
forumRouter.delete("/:postId", requireAuth, async (req: Request, res: Response) => {
  const moduleId = Array.isArray(req.params.moduleId)
    ? req.params.moduleId[0]
    : req.params.moduleId;
  const postId = Array.isArray(req.params.postId)
    ? req.params.postId[0]
    : req.params.postId;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "admin";

  const client = supabaseAdmin || supabasePublic;

  if (!client) {
    const posts = devPosts.get(moduleId) || [];
    const index = posts.findIndex((p) => p.id === postId);

    if (index === -1) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const post = posts[index];
    if (post.author_id !== userId && !isAdmin) {
      res.status(403).json({ error: "Only the author or an admin can delete this post" });
      return;
    }

    posts.splice(index, 1);
    res.json({ message: "Post deleted successfully" });
    return;
  }

  const { data: existingPost, error: fetchErr } = await client
    .from("forum_posts")
    .select("author_id")
    .eq("id", postId)
    .single();

  if (fetchErr || !existingPost) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (existingPost.author_id !== userId && !isAdmin) {
    res.status(403).json({ error: "Only the author or an admin can delete this post" });
    return;
  }

  const { error: deleteErr } = await client
    .from("forum_posts")
    .delete()
    .eq("id", postId);

  if (deleteErr) {
    res.status(500).json({ error: deleteErr.message });
    return;
  }

  res.json({ message: "Post deleted successfully" });
});
