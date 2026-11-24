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

function SilentRoomScreen({
  roomId,
  isClosed,
  onForum,
  onUnavailable,
}: SilentRoomScreenProps) {
  const [studyStatus, setStudyStatus] = useState("Chapter 1 review");
  const [statusSaved, setStatusSaved] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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
              owner: i.profiles?.full_name ?? "Participant",
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

    apiToggleChecklist(roomId, itemId, nextState).catch(() => {
      // revert on failure
      setChecklist((currentItems) =>
        currentItems.map((i) =>
          i.id === itemId ? { ...i, complete: !nextState } : i
        )
      );
      onUnavailable("Failed to save checklist change.");
    });
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
        onUnavailable("Failed to add checklist item. Is the room still open?");
      });
  }

  function submitStudyStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateStudyStatus(roomId, studyStatus)
      .then(() => {
        setStatusSaved(true);
        setTimeout(() => setStatusSaved(false), 2000);
      })
      .catch(() => {
        onUnavailable("Failed to update study status.");
      });
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
          {checklist.length === 0 ? (
            <p className="panel-helper">No checklist items for this room.</p>
          ) : (
            <ul className="room-checklist">
              {checklist.map((item) => (
                <li className="checklist-item" key={item.id}>
                  <input
                    type="checkbox"
                    checked={item.complete}
                    readOnly
                    aria-label={`${item.text} — ${item.complete ? "complete" : "incomplete"}`}
                  />
                  <span className={item.complete ? "task-complete" : ""}>
                    {item.text}
                    <small>Added by {item.owner}</small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  function activeRoomView() {
    return (
      <div className="room-layout">
        <div className="room-main">
          <section className="participant-grid" aria-label="Participant video feeds">
            {participants.map((p, i) => (
              <div
                className={`participant-feed${p.currentUser ? " is-current-user" : ""}${p.cameraUnavailable ? " camera-off" : ""}`}
                key={i}
              >
                {p.cameraUnavailable ? (
                  <>
                    <CameraOff size={20} aria-hidden="true" />
                    <span>Camera unavailable</span>
                  </>
                ) : (
                  <>
                    <span className="participant-name">{p.name}</span>
                    <span className="participant-status">{p.status}</span>
                  </>
                )}
              </div>
            ))}
          </section>

          <section className="status-composer" aria-labelledby="status-heading">
            <div className="section-heading">
              <div>
                <h2 id="status-heading">Your study status</h2>
                <p>Shared with everyone in the room</p>
              </div>
              <Pencil size={16} aria-hidden="true" />
            </div>
            <form className="status-form" onSubmit={submitStudyStatus}>
              <label className="visually-hidden" htmlFor="study-status">
                Study status
              </label>
              <input
                id="study-status"
                value={studyStatus}
                onChange={(event) => setStudyStatus(event.target.value.slice(0, 60))}
                placeholder="What are you working on?"
                maxLength={60}
              />
              <button className="primary-button" type="submit" disabled={statusSaved}>
                {statusSaved ? (
                  <>
                    <Check size={15} aria-hidden="true" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Video size={15} aria-hidden="true" />
                    Update status
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        <aside className="room-sidebar">
          <section className="timer-panel" aria-labelledby="timer-heading">
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
                            "Checklist editing is not yet available.",
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
                            "Checklist deletion is not yet available.",
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
          {isClosed ? "Closed" : "Live"}
        </span>
      </header>

      {isClosed ? closedRoomView() : activeRoomView()}
    </div>
  );
}

export default SilentRoomScreen;
