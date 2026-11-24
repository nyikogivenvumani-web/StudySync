import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Users,
  Video,
  WifiOff,
} from "lucide-react";
import { fetchRooms, type RoomItem } from "../../lib/api.js";

type Room = {
  id: string;
  moduleCode: string;
  title: string;
  participants: number;
  status: "open" | "full";
};

type ClosedRoom = {
  id: string;
  moduleCode: string;
  title: string;
};

type DiscoverScreenProps = {
  selectedModules: string[];
  onEditProfile: () => void;
  onJoinRoom: (roomId: string) => void;
  onViewChecklist: (roomId: string) => void;
};

const capacity = 20;

const roomSamples: Room[] = [
  {
    id: "room-mat-01",
    moduleCode: "MAT2611",
    title: "Linear Algebra II & Matrix Methods",
    participants: 8,
    status: "open",
  },
  {
    id: "room-cos-01",
    moduleCode: "COS1511",
    title: "Introduction to Programming I",
    participants: 14,
    status: "open",
  },
  {
    id: "room-mat-02",
    moduleCode: "MAT2611",
    title: "Linear Algebra II & Matrix Methods",
    participants: capacity,
    status: "full",
  },
  {
    id: "room-ecs-01",
    moduleCode: "ECS1501",
    title: "Economics IA: Microeconomics",
    participants: 9,
    status: "open",
  },
];

const closedRoomSamples: ClosedRoom[] = [
  {
    id: "room-cos-closed",
    moduleCode: "COS1511",
    title: "Introduction to Programming I",
  },
  {
    id: "room-ecs-closed",
    moduleCode: "ECS1501",
    title: "Economics IA: Microeconomics",
  },
];

function DiscoverScreen({
  selectedModules,
  onEditProfile,
  onJoinRoom,
  onViewChecklist,
}: DiscoverScreenProps) {
  const [liveOpenRooms, setLiveOpenRooms] = useState<RoomItem[]>([]);
  const [liveClosedRooms, setLiveClosedRooms] = useState<RoomItem[]>([]);

  useEffect(() => {
    fetchRooms()
      .then((data) => {
        if (data.openRooms?.length > 0) setLiveOpenRooms(data.openRooms);
        if (data.closedRooms?.length > 0) setLiveClosedRooms(data.closedRooms);
      })
      .catch(() => {});
  }, []);

  const openRooms: Room[] = liveOpenRooms.length > 0
    ? liveOpenRooms
        .filter((r) => !r.module_code || selectedModules.includes(r.module_code))
        .map((r) => ({
          id: r.id,
          moduleCode: r.module_code || "MAT2611",
          title: r.title,
          participants: r.occupancy,
          status: r.is_full ? ("full" as const) : ("open" as const),
        }))
    : roomSamples.filter((room) => selectedModules.includes(room.moduleCode));

  const closedRooms: ClosedRoom[] = liveClosedRooms.length > 0
    ? liveClosedRooms
        .filter((r) => !r.module_code || selectedModules.includes(r.module_code))
        .map((r) => ({
          id: r.id,
          moduleCode: r.module_code || "MAT2611",
          title: r.title,
        }))
    : closedRoomSamples.filter((room) => selectedModules.includes(room.moduleCode));

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
        <span className="preview-chip">Preview data</span>
      </header>

      <section className="preview-banner" role="status">
        <WifiOff size={18} aria-hidden="true" />
        <p>
          Sample rooms only. Live availability and room actions are not connected
          yet.
        </p>
      </section>

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
            Microphones stay off. Keep your camera on and study quietly with
            classmates.
          </p>
        </div>
        <span className="protocol-badge">
          <ShieldCheck size={15} aria-hidden="true" />
          Room rules
        </span>
      </section>

      {selectedModules.length === 0 ? (
        <section className="empty-state" aria-labelledby="no-modules-heading">
          <AlertCircle size={24} aria-hidden="true" />
          <h2 id="no-modules-heading">Choose modules to see study rooms</h2>
          <p>
            Add at least one active module to your profile to filter room
            discovery.
          </p>
          <button className="primary-button action-button" onClick={onEditProfile}>
            Edit module profile
          </button>
        </section>
      ) : (
        <>
          <section aria-labelledby="open-rooms-heading">
            <div className="section-heading room-list-heading">
              <div>
                <h2 id="open-rooms-heading">Open rooms</h2>
                <p>Rooms for your selected modules, with seats available.</p>
              </div>
              <span className="room-count">{openRooms.length} sample rooms</span>
            </div>

            {openRooms.length > 0 ? (
              <div className="room-grid">
                {openRooms.map((room) => {
                  const isFull =
                    room.status === "full" || room.participants >= capacity;
                  return (
                    <article className="room-card" key={room.id}>
                      <div className="room-card-topline">
                        <span className="room-module-tag">
                          {room.moduleCode}
                        </span>
                        <span
                          className={`room-state ${isFull ? "is-full" : "is-open"}`}
                        >
                          <span className="state-dot" aria-hidden="true" />
                          {isFull ? "Full" : "Open"}
                        </span>
                      </div>
                      <h3>{room.moduleCode}</h3>
                      <p className="room-title">{room.title}</p>
                      <div className="occupancy-row">
                        <span>Occupancy</span>
                        <span>
                          {room.participants}/{capacity} participants
                        </span>
                      </div>
                      <div
                        className={`occupancy-track${isFull ? " is-full" : ""}`}
                        role="progressbar"
                        aria-label={`${room.moduleCode} room occupancy`}
                        aria-valuemin={0}
                        aria-valuemax={capacity}
                        aria-valuenow={room.participants}
                      >
                        <span
                          style={{
                            width: `${(room.participants / capacity) * 100}%`,
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
                        disabled={isFull}
                        onClick={() => onJoinRoom(room.id)}
                      >
                        {isFull ? (
                          <>
                            <LockKeyhole size={16} aria-hidden="true" />
                            Room full (20/20)
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
                <p>No sample rooms are available for the selected modules.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="closed-rooms-heading">
            <div className="section-heading room-list-heading">
              <div>
                <h2 id="closed-rooms-heading">Closed rooms</h2>
                <p>Previously closed rooms remain available for checklists.</p>
              </div>
              <span className="room-count">{closedRooms.length} sample rooms</span>
            </div>
            {closedRooms.length > 0 ? (
              <div className="closed-room-list">
                {closedRooms.map((room) => (
                  <article className="closed-room-row" key={room.id}>
                    <div className="closed-room-details">
                      <span className="room-module-tag">{room.moduleCode}</span>
                      <div>
                        <h3>{room.title}</h3>
                        <p>{room.moduleCode} study room</p>
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
