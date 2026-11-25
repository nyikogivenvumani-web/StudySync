import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pin, PinOff, ShieldCheck, Trash2 } from "lucide-react";
import { toDisplayPost, type ForumPost } from "../forum/forumData.js";
import {
  deleteForumPost,
  fetchForumPosts,
  pinForumPost,
  type ModuleOption,
} from "../../lib/api.js";
import AdminConfirmDialog from "./AdminConfirmDialog.js";

type ForumModerationScreenProps = {
  modules: ModuleOption[];
  currentUserId: string;
  onUnavailable: (message: string) => void;
  onCatalogue: () => void;
};

function ForumModerationScreen({
  modules: catalogue,
  currentUserId,
  onUnavailable,
  onCatalogue,
}: ForumModerationScreenProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const loadPosts = useCallback(async () => {
    try {
      const all = await Promise.all(
        catalogue.map(async (m) =>
          (await fetchForumPosts(m.id ?? m.code)).map((p) =>
            toDisplayPost(p, m.code, currentUserId),
          ),
        ),
      );
      setPosts(all.flat());
    } catch {
      onUnavailable("Could not load forum posts.");
    } finally {
      setLoading(false);
    }
  }, [catalogue, currentUserId, onUnavailable]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

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
    pinForumPost(post.moduleId, post.id, !post.pinned)
      .then(loadPosts)
      .catch(() => onUnavailable("Could not change the pin on that post."));
  }

  function removePost() {
    if (!postToRemove) return;
    deleteForumPost(postToRemove.moduleId, postToRemove.id)
      .then(loadPosts)
      .catch(() => onUnavailable("Could not remove that post."));
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
      </header>

      <section className="admin-workspace-card moderation-workspace">
        <div className="moderation-toolbar">
          <div>
            <h2>Module posts</h2>
            <p>{loading ? "Loading…" : `${visiblePosts.length} posts`}</p>
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
                      {post.author}
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
          description={`Remove the post by ${postToRemove.author} in ${postToRemove.moduleCode}? It will disappear from the student forum.`}
          confirmLabel="Remove post"
          onCancel={() => setRemoveId(null)}
          onConfirm={removePost}
        />
      )}
    </div>
  );
}

export default ForumModerationScreen;
