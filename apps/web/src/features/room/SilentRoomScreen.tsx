import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Check,
  Clock3,
  MessageSquare,
  Plus,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import {
  fetchRoomDetails,
  fetchRoomTimer,
  fetchChecklist,
  addChecklistItem,
  deleteChecklistItem,
  joinRoom,
  leaveRoom,
  toggleChecklistItem as apiToggleChecklist,
  updateStudyStatus,
  type RoomItem,
  type TimerState,
} from "../../lib/api.js";
import { useDailyCall, type DailyVideoParticipant } from "../../hooks/useDailyCall.js";

type ChecklistItem = {
  id: string;
  text: string;
  owner: string;
  complete: boolean;
};

type SilentRoomScreenProps = {
  roomId: string;
  currentUserId: string;
  onDiscover: () => void;
  onForum: () => void;
  onUnavailable: (message: string) => void;
};

function DailyVideoTile({ participant }: { participant: DailyVideoParticipant }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (participant.videoTrack && !participant.cameraOff) {
      el.srcObject = new MediaStream([participant.videoTrack]);
    } else {
      el.srcObject = null;
    }
  }, [participant.videoTrack, participant.cameraOff]);

  return (
    <article
      className={`participant-tile${participant.isLocal ? " is-current-user" : ""}${participant.cameraOff ? " is-camera-unavailable" : ""}`}
    >
      {participant.cameraOff || !participant.videoTrack ? (
        <div className="camera-placeholder">
          <CameraOff size={23} aria-hidden="true" />
          <strong>Camera off</strong>
          <span>{participant.name}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
        />
      )}
      <div className="participant-caption">
        <span>{participant.name}</span>
      </div>
    </article>
  );
}

function SilentRoomScreen({
  roomId,
  currentUserId,
  onDiscover,
  onForum,
  onUnavailable,
}: SilentRoomScreenProps) {
  const [room, setRoom] = useState<RoomItem | null>(null);
  const [loadError, setLoadError] = useState("");
  const [joined, setJoined] = useState(false);
  const [studyStatus, setStudyStatus] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isClosed = room?.status === "closed";
  const daily = useDailyCall(roomId, joined && !isClosed);
  const moduleCode = room?.module_code ?? "";

  useEffect(() => {
    let cancelled = false;
    fetchRoomDetails(roomId)
      .then((r) => {
        if (cancelled) return;
        setRoom(r);
        if (r.status === "open") {
          joinRoom(roomId)
            .then(() => !cancelled && setJoined(true))
            .catch((err: Error) => !cancelled && setLoadError(err.message));
        }
      })
      .catch(() => !cancelled && setLoadError("This room could not be loaded."));
    return () => {
      cancelled = true;
      leaveRoom(roomId).catch(() => {});
    };
  }, [roomId]);

  function loadChecklist() {
    fetchChecklist(roomId)
      .then((items) =>
        setChecklist(
          items.map((i) => ({
            id: i.id,
            text: i.title,
            owner: i.created_by === currentUserId ? "You" : i.profiles?.full_name || "Participant",
            complete: i.is_completed,
          })),
        ),
      )
      .catch(() => onUnavailable("Could not load the checklist."));
  }

  useEffect(() => {
    loadChecklist();
  }, [roomId]);

  useEffect(() => {
    if (isClosed) return;
    const load = () => fetchRoomTimer(roomId).then(setTimer).catch(() => {});
    load();
    const poll = setInterval(load, 5000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [roomId, isClosed]);

  const remainingSeconds =
    timer?.is_running && timer.phase_end_at
      ? Math.max(0, Math.round((new Date(timer.phase_end_at).getTime() - now) / 1000))
      : (timer?.phase_duration_minutes ?? 0) * 60;
  const timerLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  function toggleChecklistItem(itemId: string) {
    const item = checklist.find((i) => i.id === itemId);
    const nextState = !item?.complete;

    setChecklist((currentItems) =>
      currentItems.map((i) =>
        i.id === itemId ? { ...i, complete: nextState } : i
      )
    );

    apiToggleChecklist(roomId, itemId, nextState).catch(() => {
      loadChecklist();
      onUnavailable("Could not update that task.");
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
      .catch(() => onUnavailable("Could not add that task."));
  }

  function submitStudyStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateStudyStatus(roomId, studyStatus.trim())
      .then(() => onUnavailable("Study status updated."))
      .catch(() => onUnavailable("Could not update your study status."));
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
                {daily.isConnected ? "Live video" : "Connecting…"}
              </span>
              {daily.isConnected ? (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={daily.toggleCamera}
                >
                  {daily.isCameraOn ? (
                    <>
                      <Camera size={14} aria-hidden="true" />
                      Camera on
                    </>
                  ) : (
                    <>
                      <CameraOff size={14} aria-hidden="true" />
                      Camera off
                    </>
                  )}
                </button>
              ) : (
                <span className="video-quality">Low-bandwidth video</span>
              )}
            </div>
            <div className="participant-grid">
              {daily.isConnected && daily.participants.length > 0 ? (
                daily.participants.map((p) => (
                  <DailyVideoTile key={p.id} participant={p} />
                ))
              ) : (
                <p role="status">
                  {daily.error
                    ? `Video unavailable: ${daily.error}`
                    : "Connecting to the video room…"}
                </p>
              )}
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
            <p className="timer-value">{timer ? timerLabel : "--:--"}</p>
            <div className="timer-meta">
              <span>{timer?.phase === "break" ? "Break" : "Focus block"}</span>
              <span>{timer?.is_running ? "Running" : "Not started"}</span>
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
                        aria-label={`Delete ${item.text}`}
                        onClick={() =>
                          deleteChecklistItem(roomId, item.id)
                            .then(() =>
                              setChecklist((c) => c.filter((i) => i.id !== item.id)),
                            )
                            .catch(() => onUnavailable("Could not delete that task."))
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
            {moduleCode || "Study room"} · {isClosed ? "Read-only checklist" : "Video-only focus session"}
          </p>
        </div>
        {isClosed && <span className="closed-badge">Closed</span>}
      </header>

      {loadError ? (
        <p role="alert">{loadError}</p>
      ) : !room ? (
        <p role="status">Loading room…</p>
      ) : isClosed ? (
        closedRoomView()
      ) : (
        activeRoomView()
      )}
    </div>
  );
}

export default SilentRoomScreen;
