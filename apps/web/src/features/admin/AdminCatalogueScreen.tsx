import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BookOpen, DoorOpen, FilePlus2, ShieldCheck } from "lucide-react";
import AdminConfirmDialog from "./AdminConfirmDialog.js";
import {
  closeRoom,
  createModule,
  createRoom,
  fetchRooms,
  type ModuleOption,
  type RoomItem,
} from "../../lib/api.js";

type AdminTab = "catalogue" | "rooms";

type AdminCatalogueScreenProps = {
  modules: ModuleOption[];
  onModulesChanged: () => void;
  onUnavailable: (message: string) => void;
  onModeration: () => void;
};

function AdminCatalogueScreen({
  modules,
  onModulesChanged,
  onUnavailable,
  onModeration,
}: AdminCatalogueScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("catalogue");
  const [search, setSearch] = useState("");
  const [openRooms, setOpenRooms] = useState<RoomItem[]>([]);
  const [closedRooms, setClosedRooms] = useState<RoomItem[]>([]);
  const [roomToClose, setRoomToClose] = useState<RoomItem | null>(null);

  const loadRooms = useCallback(() => {
    fetchRooms()
      .then((data) => {
        setOpenRooms(data.openRooms ?? []);
        setClosedRooms(data.closedRooms ?? []);
      })
      .catch(() => onUnavailable("Could not load rooms."));
  }, [onUnavailable]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const filtered = modules.filter((m) =>
    `${m.code} ${m.title} ${m.subject}`.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreateModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    createModule({
      code: String(data.get("code")),
      title: String(data.get("title")),
      subject: String(data.get("subject")),
      institution_type: data.get("institution_type") === "College" ? "College" : "University",
    })
      .then(() => {
        form.reset();
        onModulesChanged();
        onUnavailable("Module added.");
      })
      .catch((err: Error) => onUnavailable(err.message));
  }

  function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const code = String(data.get("module"));
    const mod = modules.find((m) => m.code === code);
    if (!mod) return;
    createRoom({
      module_id: mod.id ?? mod.code,
      module_code: mod.code,
      title: String(data.get("title") || "") || undefined,
    })
      .then(() => {
        form.reset();
        loadRooms();
        onUnavailable("Room created.");
      })
      .catch((err: Error) => onUnavailable(err.message));
  }

  function confirmClose() {
    if (!roomToClose) return;
    closeRoom(roomToClose.id)
      .then(() => {
        loadRooms();
        onUnavailable("Room closed.");
      })
      .catch(() => onUnavailable("Could not close the room."));
    setRoomToClose(null);
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading admin-screen-heading">
        <div>
          <p className="eyebrow">Admin console / Catalogue</p>
          <h1>Module catalogue &amp; room governance</h1>
          <p className="screen-intro">Manage modules and study rooms.</p>
        </div>
      </header>

      <section className="admin-summary-grid" aria-label="Summary">
        <article className="admin-summary-card">
          <span>
            <BookOpen size={17} aria-hidden="true" />
            Catalogue modules
          </span>
          <strong>{modules.length}</strong>
        </article>
        <article className="admin-summary-card">
          <span>
            <DoorOpen size={17} aria-hidden="true" />
            Open rooms
          </span>
          <strong>{openRooms.length}</strong>
        </article>
      </section>

      <section className="admin-workspace-card">
        <div className="admin-tabs" role="group" aria-label="Admin sections">
          <button
            type="button"
            className="admin-tab"
            aria-pressed={activeTab === "catalogue"}
            onClick={() => setActiveTab("catalogue")}
          >
            <BookOpen size={16} aria-hidden="true" />
            Catalogue
          </button>
          <button
            type="button"
            className="admin-tab"
            aria-pressed={activeTab === "rooms"}
            onClick={() => setActiveTab("rooms")}
          >
            <DoorOpen size={16} aria-hidden="true" />
            Rooms
          </button>
          <button type="button" className="admin-tab moderation-tab" onClick={onModeration}>
            <ShieldCheck size={16} aria-hidden="true" />
            Forum moderation
          </button>
        </div>

        {activeTab === "catalogue" ? (
          <section aria-labelledby="catalogue-table-heading">
            <div className="admin-table-heading">
              <h2 id="catalogue-table-heading">Modules</h2>
              <label className="form-field">
                <span className="visually-hidden">Search modules</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modules"
                />
              </label>
            </div>
            <form className="request-form" onSubmit={handleCreateModule} aria-label="Add module">
              <label className="form-field">
                <span>Module code</span>
                <input name="code" required maxLength={24} />
              </label>
              <label className="form-field">
                <span>Title</span>
                <input name="title" required maxLength={120} />
              </label>
              <label className="form-field">
                <span>Subject</span>
                <input name="subject" required maxLength={60} />
              </label>
              <label className="form-field">
                <span>Institution type</span>
                <select name="institution_type" defaultValue="University">
                  <option>University</option>
                  <option>College</option>
                </select>
              </label>
              <button className="primary-button request-submit" type="submit">
                <FilePlus2 size={15} aria-hidden="true" />
                Add module
              </button>
            </form>
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Title</th>
                    <th scope="col">Subject</th>
                    <th scope="col">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.code}>
                      <td>{m.code}</td>
                      <td>{m.title}</td>
                      <td>{m.subject}</td>
                      <td>{m.institution_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="empty-inline">No modules found.</p>}
            </div>
          </section>
        ) : (
          <section aria-labelledby="rooms-heading">
            <div className="admin-table-heading">
              <h2 id="rooms-heading">Study rooms</h2>
            </div>
            <form className="request-form" onSubmit={handleCreateRoom} aria-label="Create room">
              <label className="form-field">
                <span>Module</span>
                <select name="module" required defaultValue="">
                  <option value="" disabled>
                    Select a module
                  </option>
                  {modules.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.code} · {m.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>
                  Room title <span className="optional-label">Optional</span>
                </span>
                <input name="title" maxLength={120} />
              </label>
              <button className="primary-button request-submit" type="submit">
                <DoorOpen size={15} aria-hidden="true" />
                Create room
              </button>
            </form>
            <div className="table-scroll">
              <table className="request-table">
                <thead>
                  <tr>
                    <th scope="col">Module</th>
                    <th scope="col">Title</th>
                    <th scope="col">Occupancy</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...openRooms, ...closedRooms].map((room) => (
                    <tr key={room.id}>
                      <td>{room.module_code}</td>
                      <td>{room.title}</td>
                      <td>
                        {room.occupancy}/{room.max_participants}
                      </td>
                      <td>{room.status === "open" ? "Open" : "Closed"}</td>
                      <td>
                        {room.status === "open" && (
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => setRoomToClose(room)}
                          >
                            Close room
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {openRooms.length + closedRooms.length === 0 && (
                <p className="empty-inline">No rooms yet.</p>
              )}
            </div>
          </section>
        )}
      </section>

      {roomToClose && (
        <AdminConfirmDialog
          title="Close this room?"
          description={`Close ${roomToClose.title}? Participants will no longer be able to join; its checklist stays available read-only.`}
          confirmLabel="Close room"
          onCancel={() => setRoomToClose(null)}
          onConfirm={confirmClose}
        />
      )}
    </div>
  );
}

export default AdminCatalogueScreen;
