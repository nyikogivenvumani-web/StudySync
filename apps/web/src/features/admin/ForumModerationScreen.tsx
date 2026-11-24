import { useMemo, useState } from "react";
import { ArrowLeft, Pin, PinOff, ShieldCheck, Trash2 } from "lucide-react";
import type { ForumPost } from "../forum/forumData.js";
import AdminConfirmDialog from "./AdminConfirmDialog.js";

type ForumModerationScreenProps = {
  posts: ForumPost[];
  onPostsChange: (posts: ForumPost[]) => void;
  onUnavailable: (message: string) => void;
  onCatalogue: () => void;
};

function ForumModerationScreen({
  posts,
  onPostsChange,
  onUnavailable,
  onCatalogue,
}: ForumModerationScreenProps) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const modules = useMemo(
    () => [...new Set(posts.map((post) => post.moduleCode))].sort(),
    [posts],
  );
  const visiblePosts =
    moduleFilter === "all"
      ? posts
      : posts.filter((post) => post.moduleCode === moduleFilter);
  const postToRemove = posts.find((post) => post.id === removeId);

  function togglePin(post: ForumPost) {
    const pinned = !post.pinned;
    onPostsChange(
      posts.map((item) =>
        item.id === post.id ? { ...item, pinned } : item,
      ),
    );
    onUnavailable(
      `Preview only: ${post.id} is now ${pinned ? "pinned" : "unpinned"} in this browser session. No server changes were saved.`,
    );
  }

  function removePost() {
    if (!postToRemove) return;
    onPostsChange(posts.filter((post) => post.id !== postToRemove.id));
    onUnavailable(
      "Preview only: the post was removed from this browser session. No server changes were saved.",
    );
    setRemoveId(null);
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
          Admin preview
        </span>
      </header>

      <section className="preview-banner" role="status">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>
          Moderation changes affect this browser preview only and are not saved
          to a forum service.
        </p>
      </section>

      <section className="admin-workspace-card moderation-workspace">
        <div className="moderation-toolbar">
          <div>
            <h2>Module posts</h2>
            <p>{visiblePosts.length} preview posts</p>
          </div>
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
        </div>

        {visiblePosts.length > 0 ? (
          <div className="moderation-post-list">
            {visiblePosts.map((post) => (
              <article
                className={`moderation-post${post.pinned ? " is-pinned" : ""}`}
                key={post.id}
              >
                <div className="moderation-post-main">
                  <div className="moderation-post-meta">
                    <span className="room-module-tag">{post.moduleCode}</span>
                    <span className="moderation-author">
                      {post.author} · {post.role}
                    </span>
                    <span className="moderation-age">{post.age}</span>
                    {post.edited && (
                      <span className="edited-label">Edited</span>
                    )}
                    {post.pinned && (
                      <span className="pinned-label">
                        <Pin size={13} aria-hidden="true" />
                        Pinned announcement
                      </span>
                    )}
                  </div>
                  <p>{post.body}</p>
                </div>
                <div className="moderation-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => togglePin(post)}
                  >
                    {post.pinned ? (
                      <PinOff size={15} aria-hidden="true" />
                    ) : (
                      <Pin size={15} aria-hidden="true" />
                    )}
                    {post.pinned ? "Unpin" : "Pin announcement"}
                  </button>
                  <button
                    className="danger-button moderation-remove-button"
                    type="button"
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
            <p>No posts match this module filter.</p>
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
          description={`Remove the post by ${postToRemove.author} in ${postToRemove.moduleCode}? It will disappear from the student forum preview.`}
          confirmLabel="Remove post"
          onCancel={() => setRemoveId(null)}
          onConfirm={removePost}
        />
      )}
    </div>
  );
}

export default ForumModerationScreen;
