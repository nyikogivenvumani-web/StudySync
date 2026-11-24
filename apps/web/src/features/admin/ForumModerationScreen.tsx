import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Pin, PinOff, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import AdminConfirmDialog from "./AdminConfirmDialog.js";
import { fetchForumPosts, pinForumPost, deleteForumPost, type ForumPost as ApiForumPost } from "../../lib/api.js";

type ForumModerationScreenProps = {
  posts: ApiForumPost[];
  onPostsChange: (posts: ApiForumPost[]) => void;
  onUnavailable: (message: string) => void;
  onCatalogue: () => void;
};

type LocalPost = ApiForumPost & { moduleCode: string };

function ForumModerationScreen({
  onUnavailable,
  onCatalogue,
}: ForumModerationScreenProps) {
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removingModuleId, setRemovingModuleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load posts for all well-known modules (fetch by module_id)
  function loadPosts() {
    setLoading(true);
    // Fetch posts for each enrolled module by using an empty module id
    // The forum router uses moduleId from the URL — we need a list of modules first.
    // For now, fetch with a wildcard-style approach: use the rooms API isn't needed.
    // We'll use a fixed list of common module IDs from the seed data.
    // A proper solution would need a /api/forum/all admin endpoint.
    // For the MVP: load from the first selected module; admin can filter.
    const knownModules = ["MAT2611", "COS1511", "ECS1501"];
    Promise.all(knownModules.map((id) => fetchForumPosts(id).then((ps) =>
      ps.map((p) => ({ ...p, moduleCode: id }))
    )))
      .then((results) => {
        setPosts(results.flat());
      })
      .catch(() => onUnavailable("Could not load forum posts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const modules = useMemo(
    () => [...new Set(posts.map((p) => p.moduleCode))].sort(),
    [posts],
  );

  const visiblePosts =
    moduleFilter === "all"
      ? posts
      : posts.filter((p) => p.moduleCode === moduleFilter);

  const postToRemove = posts.find((p) => p.id === removeId);

  function togglePin(post: LocalPost) {
    const newPinned = !post.is_pinned;
    setPosts((prev) =>
      prev.map((p) => p.id === post.id ? { ...p, is_pinned: newPinned } : p)
    );
    pinForumPost(post.moduleCode, post.id, newPinned).catch(() => {
      setPosts((prev) =>
        prev.map((p) => p.id === post.id ? { ...p, is_pinned: !newPinned } : p)
      );
      onUnavailable("Failed to update pin status.");
    });
  }

  function removePost() {
    if (!postToRemove) return;
    setRemovingModuleId(postToRemove.moduleCode);
    deleteForumPost(postToRemove.moduleCode, postToRemove.id)
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.id !== postToRemove.id));
      })
      .catch(() => {
        onUnavailable("Failed to delete post.");
      })
      .finally(() => {
        setRemoveId(null);
        setRemovingModuleId(null);
      });
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading admin-screen-heading">
        <div>
          <p className="eyebrow">Admin console / Forum moderation</p>
          <h1>Forum moderation</h1>
          <p className="screen-intro">
            Pin module announcements or remove posts that do not belong in the
            academic noticeboard.
          </p>
        </div>
        <span className="preview-chip admin-preview-chip">
          <ShieldCheck size={14} aria-hidden="true" />
          Admin
        </span>
      </header>

      <section className="admin-workspace-card moderation-workspace">
        <div className="moderation-toolbar">
          <div>
            <h2>Module posts</h2>
            <p>{visiblePosts.length} posts</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <label className="form-field moderation-filter">
              <span>Filter by module</span>
              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
              >
                <option value="all">All modules</option>
                {modules.map((moduleCode) => (
                  <option key={moduleCode} value={moduleCode}>
                    {moduleCode}
                  </option>
                ))}
              </select>
            </label>
            <button className="secondary-button" onClick={loadPosts} aria-label="Refresh posts">
              <RefreshCw size={15} aria-hidden="true" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="panel-helper">Loading posts…</p>
        ) : visiblePosts.length > 0 ? (
          <div className="moderation-post-list">
            {visiblePosts.map((post) => (
              <article
                className={`moderation-post${post.is_pinned ? " is-pinned" : ""}`}
                key={post.id}
              >
                <div className="moderation-post-main">
                  <div className="moderation-post-meta">
                    <span className="room-module-tag">{post.moduleCode}</span>
                    <span className="moderation-author">
                      {post.profiles?.full_name ?? post.author_name ?? "Student"}
                    </span>
                    {post.is_pinned && (
                      <span className="pinned-label">
                        <Pin size={13} aria-hidden="true" />
                        Pinned announcement
                      </span>
                    )}
                    {post.edited_at && (
                      <span className="edited-label">Edited</span>
                    )}
                  </div>
                  <p>{post.content}</p>
                </div>
                <div className="moderation-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => togglePin(post)}
                  >
                    {post.is_pinned ? (
                      <PinOff size={15} aria-hidden="true" />
                    ) : (
                      <Pin size={15} aria-hidden="true" />
                    )}
                    {post.is_pinned ? "Unpin" : "Pin announcement"}
                  </button>
                  <button
                    className="danger-button moderation-remove-button"
                    type="button"
                    disabled={removingModuleId === post.moduleCode}
                    onClick={() => setRemoveId(post.id)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Remove post
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inline moderation-empty">
            <ShieldCheck size={22} aria-hidden="true" />
            <p>No posts found. Posts will appear here once students publish them.</p>
          </div>
        )}
      </section>

      <button
        className="secondary-button back-to-catalogue"
        type="button"
        onClick={onCatalogue}
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to catalogue management
      </button>

      {postToRemove && (
        <AdminConfirmDialog
          title="Remove this forum post?"
          description={`Remove the post in ${postToRemove.moduleCode}? This cannot be undone.`}
          confirmLabel="Remove post"
          onCancel={() => setRemoveId(null)}
          onConfirm={removePost}
        />
      )}
    </div>
  );
}

export default ForumModerationScreen;
