import { useState, useEffect } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { fetchRooms, joinRoom, type RoomItem } from "../../lib/api.js";

type DiscoverScreenProps = {
  selectedModules: string[];
  onEditProfile: () => void;
  onJoinRoom: (roomId: string) => void;
  onViewChecklist: (roomId: string) => void;
};

const capacity = 20;

function DiscoverScreen({
  selectedModules,
  onEditProfile,
  onJoinRoom,
  onViewChecklist,
}: DiscoverScreenProps) {
  const [openRooms, setOpenRooms] = useState<RoomItem[]>([]);
  const [closedRooms, setClosedRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function loadRooms() {
    setLoading(true);
    setError("");
    fetchRooms()
      .then((data) => {
        setOpenRooms(data.openRooms ?? []);
        setClosedRooms(data.closedRooms ?? []);
      })
      .catch(() => setError("Could not load rooms. Is the API running?"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function handleJoin(roomId: string) {
    setJoiningId(roomId);
    try {
      await joinRoom(roomId);
      onJoinRoom(roomId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to join room";
      setError(msg);
    } finally {
      setJoiningId(null);
    }
  }

  const filteredOpen = selectedModules.length > 0
    ? openRooms.filter((r) => !r.module_code || selectedModules.includes(r.module_code))
    : openRooms;

  const filteredClosed = selectedModules.length > 0
    ? closedRooms.filter((r) => !r.module_code || selectedModules.includes(r.module_code))
    : closedRooms;

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <p className="eyebrow">Student workspace / Discover</p>
          <h1>Study room discovery</h1>
          <p className="screen-intro">
            Find open study rooms for your active modules.
          </p>
        </div>
        <button className="secondary-button" onClick={loadRooms} aria-label="Refresh rooms">
          <RefreshCw size={15} aria-hidden="true" />
          Refresh
        </button>
      </header>

      {error && (
        <section className="preview-banner" role="alert">
          <p>{error}</p>
        </section>
      )}

      <section className="module-context" aria-label="Active modules filter">
        <div className="context-title">
          <span>Active modules</span>
          <span className="context-count">{selectedModules.length} selected</span>
        </div>
        <div className="context-chips">
          {selectedModules.length > 0 ? (
            selectedModules.map((code) => (
              <span className="module-chip" key={code}>
                <span className="online-dot" aria-hidden="true" />
                {code}
              </span>
            ))
          ) : (
            <p className="no-modules">No active modules selected.</p>
          )}
          <button className="text-button edit-modules" onClick={onEditProfile}>
            Edit profile
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="room-protocol" aria-label="Room rules">
        <span className="protocol-icon" aria-hidden="true">
          <Video size={20} />
        </span>
        <div>
          <h2>Silent, video-only study</h2>
          <p>
            Cameras on, microphones off. All rooms follow the silent study protocol.
          </p>
        </div>
        <span className="protocol-badge">
          <ShieldCheck size={14} aria-hidden="true" />
          Enforced
        </span>
      </section>

      {loading ? (
        <p className="panel-helper">Loading rooms…</p>
      ) : (
        <>
          <section aria-labelledby="open-rooms-heading">
            <div className="section-heading room-list-heading">
              <div>
                <h2 id="open-rooms-heading">Open rooms</h2>
                <p>Join a room to begin your focus session.</p>
              </div>
              <span className="room-count">{filteredOpen.length} rooms</span>
            </div>

            {filteredOpen.length > 0 ? (
              <div className="room-grid">
                {filteredOpen.map((room) => {
                  const isFull = room.is_full || room.occupancy >= capacity;
                  const isJoining = joiningId === room.id;
                  return (
                    <article className="room-card" key={room.id}>
                      <div className="room-card-topline">
                        <span className="room-module-tag">
                          {room.module_code ?? "—"}
                        </span>
                        <span className={`room-state ${isFull ? "is-full" : "is-open"}`}>
                          <span className="state-dot" aria-hidden="true" />
                          {isFull ? "Full" : "Open"}
                        </span>
                      </div>
                      <h3>{room.module_code ?? "Study room"}</h3>
                      <p className="room-title">{room.title}</p>
                      <div className="occupancy-row">
                        <span>Occupancy</span>
                        <span>
                          {room.occupancy}/{capacity} participants
                        </span>
                      </div>
                      <div
                        className={`occupancy-track${isFull ? " is-full" : ""}`}
                        role="progressbar"
                        aria-label={`${room.module_code} room occupancy`}
                        aria-valuemin={0}
                        aria-valuemax={capacity}
                        aria-valuenow={room.occupancy}
                      >
                        <span
                          style={{
                            width: `${(room.occupancy / capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        className={
                          isFull
                            ? "secondary-button room-action is-disabled"
                            : "primary-button room-action"
                        }
                        type="button"
                        disabled={isFull || isJoining}
                        onClick={() => handleJoin(room.id)}
                      >
                        {isFull ? (
                          <>
                            <LockKeyhole size={16} aria-hidden="true" />
                            Room full (20/20)
                          </>
                        ) : isJoining ? (
                          <>
                            <RefreshCw size={16} aria-hidden="true" />
                            Joining…
                          </>
                        ) : (
                          <>
                            <Video size={16} aria-hidden="true" />
                            Join room
                          </>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-inline">
                <Users size={20} aria-hidden="true" />
                <p>
                  {selectedModules.length > 0
                    ? "No open rooms for your selected modules."
                    : "No open rooms yet."}
                </p>
                <button className="secondary-button" onClick={() => {
                  const form = document.querySelector<HTMLFormElement>(".create-room-form");
                  form?.scrollIntoView({ behavior: "smooth" });
                }}>
                  <Plus size={15} aria-hidden="true" />
                  Create a room
                </button>
              </div>
            )}
          </section>

          <section aria-labelledby="closed-rooms-heading">
            <div className="section-heading room-list-heading">
              <div>
                <h2 id="closed-rooms-heading">Closed rooms</h2>
                <p>Previously closed rooms remain available for checklists.</p>
              </div>
              <span className="room-count">{filteredClosed.length} rooms</span>
            </div>
            {filteredClosed.length > 0 ? (
              <div className="closed-room-list">
                {filteredClosed.map((room) => (
                  <article className="closed-room-row" key={room.id}>
                    <div className="closed-room-details">
                      <span className="room-module-tag">{room.module_code ?? "—"}</span>
                      <div>
                        <h3>{room.title}</h3>
                        <p>{room.module_code} study room</p>
                      </div>
                    </div>
                    <div className="closed-room-actions">
                      <span className="closed-badge">Closed</span>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => onViewChecklist(room.id)}
                      >
                        View checklist
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-inline">
                <p>No closed rooms yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default DiscoverScreen;
