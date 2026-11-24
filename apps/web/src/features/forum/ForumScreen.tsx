import { useState, useEffect, type FormEvent } from "react";
import {
  BookOpen,
  Check,
  LockKeyhole,
  Pencil,
  Pin,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { fetchForumPosts, createForumPost, type ForumPost as ApiForumPost } from "../../lib/api.js";

type ForumScreenProps = {
  moduleCode: string;
  onUnavailable: (message: string) => void;
};

type LocalPost = {
  id: string;
  author: string;
  role: "Student" | "Admin";
  body: string;
  is_pinned: boolean;
  edited: boolean;
  ownedByCurrentUser: boolean;
  created_at: string;
};

function toLocalPost(p: ApiForumPost, currentUserId?: string): LocalPost {
  return {
    id: p.id,
    author: p.profiles?.full_name ?? p.author_name ?? "Student",
    role: "Student",
    body: p.content,
    is_pinned: p.is_pinned,
    edited: !!p.edited_at,
    ownedByCurrentUser: !!currentUserId && p.author_id === currentUserId,
    created_at: p.created_at,
  };
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

function ForumScreen({ moduleCode, onUnavailable }: ForumScreenProps) {
  const [posts, setPosts] = useState<LocalPost[]>([]);
  const [draft, setDraft] = useState("");
  const [editingPost, setEditingPost] = useState<LocalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadPosts() {
    setLoading(true);
    setError("");
    fetchForumPosts(moduleCode)
      .then((data) => {
        setPosts(data.map((p) => toLocalPost(p)));
      })
      .catch(() => setError("Could not load forum posts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (moduleCode) loadPosts();
  }, [moduleCode]);

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;

    setSubmitting(true);
    createForumPost(moduleCode, draft.trim())
      .then((post) => {
        setPosts((prev) => [toLocalPost(post), ...prev]);
        setDraft("");
        setEditingPost(null);
      })
      .catch(() => {
        onUnavailable("Failed to publish post. Is the API running?");
      })
      .finally(() => setSubmitting(false));
  }

  function startEditing(post: LocalPost) {
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

      {error && (
        <section className="preview-banner" role="alert">
          <p>{error}</p>
        </section>
      )}

      <div className="forum-layout">
        <div className="forum-feed">
          <section className="workspace-card module-forum-heading">
            <div className="module-forum-tags">
              <span className="catalogue-label">Enrolled module</span>
              <span className="room-module-tag">Code {moduleCode}</span>
            </div>
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
                    disabled={!draft.trim() || submitting}
                  >
                    <Send size={15} aria-hidden="true" />
                    {submitting
                      ? "Publishing…"
                      : editingPost
                        ? "Save changes"
                        : "Publish notice"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="forum-post-list" aria-label="Module forum posts">
            {loading ? (
              <p className="panel-helper">
                <RefreshCw size={14} aria-hidden="true" /> Loading posts…
              </p>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <article
                  className={`forum-post${post.is_pinned ? " is-pinned" : ""}`}
                  key={post.id}
                >
                  <header className="forum-post-header">
                    <div className="post-avatar" aria-hidden="true">
                      {post.role === "Admin" ? (
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
                      <span className="author-role">{post.role}</span>
                      <small>
                        {timeAgo(post.created_at)}
                        {post.edited && (
                          <span className="edited-label">Edited</span>
                        )}
                      </small>
                    </div>
                    {post.is_pinned && (
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
                      {post.is_pinned ? "Official module notice" : "Module post"}
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
                <p>No posts for this module yet. Be the first to post!</p>
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
