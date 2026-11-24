import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  CameraOff,
  Check,
  Clock3,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  Video,
  WifiOff,
  X,
} from "lucide-react";
import {
  fetchRoomTimer,
  fetchChecklist,
  addChecklistItem,
  toggleChecklistItem as apiToggleChecklist,
  updateStudyStatus,
} from "../../lib/api.js";

type ChecklistItem = {
  id: string;
  text: string;
  owner: string;
  complete: boolean;
};

type Participant = {
  name: string;
  status: string;
  cameraUnavailable?: boolean;
  currentUser?: boolean;
};

type SilentRoomScreenProps = {
  roomId: string;
  isClosed: boolean;
  onDiscover: () => void;
  onForum: () => void;
  onUnavailable: (message: string) => void;
};

const participants: Participant[] = [
  { name: "You", status: "Chapter 1 review", currentUser: true },
  { name: "Sipho M.", status: "Reviewing eigenvalues" },
  { name: "Camera unavailable", status: "", cameraUnavailable: true },
  { name: "Lerato D.", status: "Vector spaces" },
  { name: "Pieter B.", status: "Problem set 2" },
  { name: "Nandi Z.", status: "Studying quietly" },
];

const initialChecklist: ChecklistItem[] = [
  {
    id: "task-1",
    text: "Complete practice questions 1–4",
    owner: "You",
    complete: true,
  },
  {
    id: "task-2",
    text: "Verify Gaussian elimination on problem set 4",
    owner: "Sipho M.",
    complete: false,
  },
  {
    id: "task-3",
    text: "Review section 1.4 proofs",
    owner: "You",
    complete: false,
  },
];

function SilentRoomScreen({
  roomId,
  isClosed,
  onDiscover,
  onForum,
  onUnavailable,
}: SilentRoomScreenProps) {
  const [studyStatus, setStudyStatus] = useState("Chapter 1 review");
  const [checklist, setChecklist] = useState(initialChecklist);
  const [newTask, setNewTask] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(50);
  const moduleCode = roomId.toLowerCase().includes("cos")
    ? "COS1511"
    : "MAT2611";

  useEffect(() => {
    fetchRoomTimer(roomId)
      .then((t) => {
        if (t?.phase_duration_minutes) {
          setTimerMinutes(t.phase_duration_minutes);
        }
      })
      .catch(() => {});

    fetchChecklist(roomId)
      .then((items) => {
        if (items.length > 0) {
          setChecklist(
            items.map((i) => ({
              id: i.id,
              text: i.title,
              owner: i.profiles?.full_name || "Participant",
              complete: i.is_completed,
            }))
          );
        }
      })
      .catch(() => {});
  }, [roomId]);

  function toggleChecklistItem(itemId: string) {
    const item = checklist.find((i) => i.id === itemId);
    const nextState = !item?.complete;

    setChecklist((currentItems) =>
      currentItems.map((i) =>
        i.id === itemId ? { ...i, complete: nextState } : i
      )
    );

    apiToggleChecklist(roomId, itemId, nextState).catch(() => {});
    onUnavailable("Preview only: checklist changes are not saved to the room.");
  }

  function submitChecklistItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTask.trim()) return;

    addChecklistItem(roomId, newTask.trim())
      .then((item) => {
        setChecklist((current) => [
          ...current,
          {
            id: item.id,
            text: item.title,
            owner: "You",
            complete: item.is_completed,
          },
        ]);
        setNewTask("");
      })
      .catch(() => {
        onUnavailable("Checklist updates are unavailable until the room service is connected.");
      });
  }

  function submitStudyStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateStudyStatus(roomId, studyStatus)
      .catch(() => {});
    onUnavailable("Your study status is only a preview and has not been shared.");
  }

  function closedRoomView() {
    return (
      <div className="closed-room-view">
        <section className="closed-room-notice" role="status">
          <ShieldCheck size={22} aria-hidden="true" />
          <div>
            <h2>This room is closed</h2>
            <p>
              The room has been closed by an administrator. Its checklist is
              available in read-only mode.
            </p>
          </div>
        </section>

        <section className="workspace-card" aria-labelledby="closed-checklist-heading">
          <div className="section-heading">
            <div>
              <h2 id="closed-checklist-heading">Shared checklist</h2>
              <p>{moduleCode} · Read-only</p>
            </div>
            <span className="closed-badge">Closed</span>
          </div>
          <ul className="room-checklist read-only-checklist">
            {checklist.map((item) => (
              <li className="checklist-item" key={item.id}>
                <span
                  className={`check-indicator${item.complete ? " is-complete" : ""}`}
                  aria-hidden="true"
                >
                  {item.complete && <Check size={13} />}
                </span>
                <span className={item.complete ? "task-complete" : ""}>
                  {item.text}
                </span>
                <small>Added by {item.owner}</small>
              </li>
            ))}
          </ul>
        </section>

        <button className="secondary-button action-button" onClick={onDiscover}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to room discovery
        </button>
      </div>
    );
  }

  function activeRoomView() {
    return (
      <div className="room-screen-grid">
        <div className="room-stage-column">
          <section className="video-stage" aria-label="Video-only participant tiles">
            <div className="video-stage-header">
              <span className="live-indicator">
                <span aria-hidden="true" />
                Preview room
              </span>
              <span className="video-quality">Low-bandwidth video</span>
            </div>
            <div className="participant-grid">
              {participants.map((participant) => (
                <article
                  className={`participant-tile${participant.currentUser ? " is-current-user" : ""}${participant.cameraUnavailable ? " is-camera-unavailable" : ""}`}
                  key={participant.name}
                >
                  {participant.cameraUnavailable ? (
                    <div className="camera-placeholder">
                      <CameraOff size={23} aria-hidden="true" />
                      <strong>Camera unavailable</strong>
                      <span>Video placeholder</span>
                    </div>
                  ) : (
                    <div className="participant-video-placeholder">
                      <span className="participant-initials" aria-hidden="true">
                        {participant.name === "You"
                          ? "Y"
                          : participant.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                      </span>
                    </div>
                  )}
                  <div className="participant-caption">
                    <span>{participant.name}</span>
                    {participant.status && (
                      <small title={participant.status}>{participant.status}</small>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="stage-footnote">
              <Video size={15} aria-hidden="true" />
              Video only · Microphones are disabled
            </div>
          </section>

          <form className="study-status-form" onSubmit={submitStudyStatus}>
            <label htmlFor="study-status">Your study status</label>
            <div className="study-status-controls">
              <input
                id="study-status"
                value={studyStatus}
                onChange={(event) =>
                  setStudyStatus(event.target.value.slice(0, 60))
                }
                maxLength={60}
              />
              <span>{studyStatus.length}/60</span>
              <button
                className="secondary-button"
                type="submit"
                disabled={!studyStatus.trim()}
              >
                Save status
              </button>
            </div>
          </form>
        </div>

        <aside className="room-side-panel">
          <section className="timer-card" aria-labelledby="timer-heading">
            <div className="timer-header">
              <div>
                <p className="eyebrow">Focus phase</p>
                <h2 id="timer-heading">Study timer</h2>
              </div>
              <Clock3 size={19} aria-hidden="true" />
            </div>
            <p className="timer-value">{timerMinutes}:00</p>
            <div className="timer-meta">
              <span>Focus block</span>
              <span>10 min break</span>
            </div>
            <p className="timer-preview-note">
              <WifiOff size={14} aria-hidden="true" />
              Preview timer · not synchronized
            </p>
          </section>

          <section className="checklist-panel" aria-labelledby="checklist-heading">
            <div className="section-heading">
              <div>
                <h2 id="checklist-heading">Shared checklist</h2>
                <p>Room tasks · oldest first</p>
              </div>
              <span className="selection-count">
                {checklist.filter((item) => item.complete).length}/
                {checklist.length}
              </span>
            </div>
            <ul className="room-checklist">
              {checklist.map((item) => (
                <li className="checklist-item" key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.complete}
                    onChange={() => toggleChecklistItem(item.id)}
                    aria-label={`${item.complete ? "Mark incomplete" : "Mark complete"}: ${item.text}`}
                  />
                  <span className={item.complete ? "task-complete" : ""}>
                    {item.text}
                    <small>Added by {item.owner}</small>
                  </span>
                  {item.owner === "You" && (
                    <span className="checklist-actions">
                      <button
                        type="button"
                        aria-label={`Edit ${item.text}`}
                        onClick={() =>
                          onUnavailable(
                            "Checklist editing is unavailable until the room service is connected.",
                          )
                        }
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${item.text}`}
                        onClick={() =>
                          onUnavailable(
                            "Checklist deletion is unavailable until the room service is connected.",
                          )
                        }
                      >
                        <X size={15} aria-hidden="true" />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <form className="checklist-composer" onSubmit={submitChecklistItem}>
              <label className="visually-hidden" htmlFor="new-checklist-item">
                Add a checklist item
              </label>
              <input
                id="new-checklist-item"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a study task..."
                maxLength={120}
              />
              <button
                className="primary-button"
                type="submit"
                aria-label="Add checklist item"
                disabled={!newTask.trim()}
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </form>
            <p className="panel-helper">Preview only; task changes are not saved.</p>
          </section>

          <button className="forum-shortcut" onClick={onForum}>
            <MessageSquare size={17} aria-hidden="true" />
            <span>
              <strong>Module forum</strong>
              <small>Open the {moduleCode} noticeboard</small>
            </span>
            <ArrowLeft className="shortcut-arrow" size={15} aria-hidden="true" />
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <p className="eyebrow">Student workspace / Silent room</p>
          <h1>{isClosed ? "Closed study room" : "Silent study room"}</h1>
          <p className="screen-intro">
            {moduleCode} · {isClosed ? "Read-only checklist" : "Video-only focus session"}
          </p>
        </div>
        <span className={isClosed ? "closed-badge" : "preview-chip"}>
          {isClosed ? "Closed" : "Preview room"}
        </span>
      </header>

      {isClosed ? closedRoomView() : activeRoomView()}
    </div>
  );
}

export default SilentRoomScreen;
