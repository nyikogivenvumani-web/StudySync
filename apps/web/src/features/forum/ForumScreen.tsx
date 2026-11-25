import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  LockKeyhole,
  Pencil,
  Pin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toDisplayPost, type ForumPost } from "./forumData.js";
import {
  createForumPost,
  editForumPost,
  fetchForumPosts,
  type ModuleOption,
} from "../../lib/api.js";

type ForumScreenProps = {
  modules: ModuleOption[];
  currentUserId: string;
  onUnavailable: (message: string) => void;
};

function ForumScreen({ modules, currentUserId, onUnavailable }: ForumScreenProps) {
  const [moduleCode, setModuleCode] = useState(modules[0]?.code ?? "");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const activeModule = modules.find((m) => m.code === moduleCode);
  const moduleId = activeModule ? (activeModule.id ?? activeModule.code) : "";
  const modulePosts = posts;

  const loadPosts = useCallback(() => {
    if (!moduleId) return Promise.resolve();
    setLoading(true);
    return fetchForumPosts(moduleId)
      .then((data) =>
        setPosts(data.map((p) => toDisplayPost(p, moduleCode, currentUserId))),
      )
      .catch(() => onUnavailable("Could not load forum posts."))
      .finally(() => setLoading(false));
  }, [moduleId, moduleCode, currentUserId, onUnavailable]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !moduleId) return;
    const request = editingPost
      ? editForumPost(moduleId, editingPost.id, draft.trim())
      : createForumPost(moduleId, draft.trim());
    request
      .then(() => {
        setDraft("");
        setEditingPost(null);
        return loadPosts();
      })
      .catch((err: Error) => onUnavailable(err.message));
  }

  function startEditing(post: ForumPost) {
    setEditingPost(post);
    setDraft(post.body);
  }

  function cancelEditing() {
    setEditingPost(null);
    setDraft("");
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <p className="eyebrow">Student workspace / Group forum</p>
          <h1>Module forum</h1>
          <p className="screen-intro">
            Share text-only study notices and module updates.
          </p>
        </div>
      </header>

      {modules.length === 0 ? (
        <section className="empty-state">
          <AlertCircle size={24} aria-hidden="true" />
          <h2>Choose a module first</h2>
          <p>Select your active modules on the Profile page to see their forums.</p>
        </section>
      ) : null}

      <div className="forum-layout">
        <div className="forum-feed">
          <section className="workspace-card module-forum-heading">
            <div className="module-forum-tags">
              <span className="catalogue-label">Enrolled module</span>
              <span className="room-module-tag">Code {moduleCode}</span>
            </div>
            <label className="form-field">
              <span>Module</span>
              <select
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
              >
                {modules.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} · {m.title}
                  </option>
                ))}
              </select>
            </label>
            <h2>{moduleCode}: Module notices</h2>
            <p>
              Text-only peer noticeboard for academic notices and schedule
              updates.
            </p>
          </section>

          <section className="workspace-card forum-composer-section">
            <div className="section-heading">
              <div>
                <h2>
                  {editingPost ? "Edit your post" : "Post a module notice"}
                </h2>
                <p>Plain text only · up to 500 characters</p>
              </div>
              <BookOpen size={18} aria-hidden="true" />
            </div>
            <form className="forum-composer" onSubmit={submitPost}>
              <label className="visually-hidden" htmlFor="forum-post">
                {editingPost ? "Edit post text" : "New post text"}
              </label>
              <textarea
                id="forum-post"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 500))}
                placeholder="Share a module notice, schedule update, or group announcement..."
                maxLength={500}
                required
              />
              <div className="composer-footer">
                <span className="character-count">
                  {draft.length}/500 characters
                </span>
                <div className="composer-actions">
                  {editingPost && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={cancelEditing}
                    >
                      Cancel edit
                    </button>
                  )}
                  <button
                    className="primary-button action-button"
                    type="submit"
                    disabled={!draft.trim()}
                  >
                    <Send size={15} aria-hidden="true" />
                    {editingPost ? "Save changes" : "Publish notice"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="forum-post-list" aria-label="Module forum posts">
            {modulePosts.length > 0 ? (
              modulePosts.map((post) => (
                <article
                  className={`forum-post${post.pinned ? " is-pinned" : ""}`}
                  key={post.id}
                >
                  <header className="forum-post-header">
                    <div className="post-avatar" aria-hidden="true">
                      {post.pinned ? (
                        <ShieldCheck size={18} />
                      ) : (
                        post.author
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                      )}
                    </div>
                    <div className="post-author">
                      <strong>{post.author}</strong>
                      <small>
                        {post.age}
                        {post.edited && (
                          <span className="edited-label">Edited</span>
                        )}
                      </small>
                    </div>
                    {post.pinned && (
                      <span className="pinned-label">
                        <Pin size={14} aria-hidden="true" />
                        Pinned notice
                      </span>
                    )}
                    {post.ownedByCurrentUser && (
                      <button
                        className="secondary-button edit-post-button"
                        type="button"
                        onClick={() => startEditing(post)}
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Edit
                      </button>
                    )}
                  </header>
                  <p className="forum-post-body">{post.body}</p>
                  <footer className="forum-post-footer">
                    <span>
                      {post.pinned ? "Official module notice" : "Module post"}
                    </span>
                    <span className="text-only-label">
                      <Check size={13} aria-hidden="true" />
                      Text only
                    </span>
                  </footer>
                </article>
              ))
            ) : (
              <div className="empty-inline">
                <p>{loading ? "Loading posts…" : "No posts for this module yet."}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="forum-sidebar">
          <section className="workspace-card forum-rules">
            <div className="section-heading">
              <h2>
                <ShieldCheck size={18} aria-hidden="true" />
                Noticeboard rules
              </h2>
            </div>
            <p>Keep this module space focused and useful for everyone.</p>
            <ul>
              <li>Course notices and study updates</li>
              <li>Respectful, academic discussion</li>
            </ul>
            <div className="rule-restrictions">
              <span>
                <LockKeyhole size={14} aria-hidden="true" />
                No attachments or image media
              </span>
              <span>
                <LockKeyhole size={14} aria-hidden="true" />
                No comments, reactions, or chat threads
              </span>
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}

export default ForumScreen;
