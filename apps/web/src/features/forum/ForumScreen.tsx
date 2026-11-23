import { useState, type FormEvent } from "react";
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

type ForumPost = {
  id: string;
  author: string;
  role: "Student" | "Admin";
  age: string;
  body: string;
  edited?: boolean;
  pinned?: boolean;
  ownedByCurrentUser?: boolean;
};

type ForumScreenProps = {
  moduleCode: string;
  onUnavailable: (message: string) => void;
};

const samplePosts: ForumPost[] = [
  {
    id: "pinned-update",
    author: "Course Administrator",
    role: "Admin",
    age: "2 hours ago",
    body: "Tutorial moved from 16:00 to 18:00 today. Please review the matrix-rank examples before the session.",
    pinned: true,
  },
  {
    id: "own-update",
    author: "Preview student (You)",
    role: "Student",
    age: "45 minutes ago",
    body: "I am reviewing Section 1.4 before the next study block. The worked examples are helpful.",
    ownedByCurrentUser: true,
  },
  {
    id: "peer-update",
    author: "Sipho M.",
    role: "Student",
    age: "15 minutes ago",
    body: "Shared notes for Gaussian elimination have been updated in the course resources.",
    edited: true,
  },
  {
    id: "reminder",
    author: "Lerato D.",
    role: "Student",
    age: "3 hours ago",
    body: "Reminder: the differential equations quiz opens tomorrow at 08:00.",
  },
];

function ForumScreen({ moduleCode, onUnavailable }: ForumScreenProps) {
  const [draft, setDraft] = useState("");
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);

  function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUnavailable(
      editingPost
        ? "Edit not saved: the module forum is not connected yet."
        : "Post not published: the module forum is not connected yet.",
    );
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
        <span className="preview-chip">Preview data</span>
      </header>

      <section className="preview-banner" role="status">
        <AlertCircle size={18} aria-hidden="true" />
        <p>
          Sample posts only. Publishing, editing, and live updates are not
          connected to the forum service.
        </p>
      </section>

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
            {samplePosts.map((post) => (
              <article
                className={`forum-post${post.pinned ? " is-pinned" : ""}`}
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
                      {post.age}
                      {post.edited && <span className="edited-label">Edited</span>}
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
                  <span>{post.pinned ? "Official module notice" : "Module post"}</span>
                  <span className="text-only-label">
                    <Check size={13} aria-hidden="true" />
                    Text only
                  </span>
                </footer>
              </article>
            ))}
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

          <section className="workspace-card forum-preview-status">
            <div className="section-heading">
              <h2>Connection status</h2>
              <span className="status-chip status-pending">Preview</span>
            </div>
            <p>
              Forum posts are sample content. Your draft will remain on this
              screen and will not be shared.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ForumScreen;
