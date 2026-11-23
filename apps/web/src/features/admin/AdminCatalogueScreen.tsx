import { useState, type FormEvent } from "react";
import {
  Archive,
  BookOpen,
  Building2,
  CircleCheck,
  DoorOpen,
  FilePlus2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import AdminConfirmDialog from "./AdminConfirmDialog.js";

type CatalogueEntry = {
  code: string;
  title: string;
  institution: string;
  level: string;
  status: "Verified" | "Pending verification" | "Archived";
};

type ModuleRequest = {
  code: string;
  title: string;
  institution: string;
  requestedBy: string;
};

type InstitutionEntry = {
  id: string;
  name: string;
  type: "University" | "College";
  status: "Verified" | "Pending verification" | "Archived";
};

type AdminTab = "catalogue" | "requests" | "rooms";
type Confirmation = {
  action: "delete" | "close" | "purge";
  label: string;
} | null;
type CreateDialog = "module" | "institution" | "room" | null;

type AdminCatalogueScreenProps = {
  onUnavailable: (message: string) => void;
  onModeration: () => void;
};

const sampleCatalogue: CatalogueEntry[] = [
  {
    code: "MAT2611",
    title: "Linear Algebra II & Matrix Methods",
    institution: "Preview University",
    level: "Level 6",
    status: "Verified",
  },
  {
    code: "COS1511",
    title: "Introduction to Programming I",
    institution: "Preview University",
    level: "Level 5",
    status: "Verified",
  },
  {
    code: "ENG2601",
    title: "Applied English Language Studies",
    institution: "Preview College",
    level: "Level 6",
    status: "Pending verification",
  },
  {
    code: "ECS1501",
    title: "Economics IA: Microeconomics",
    institution: "Preview College",
    level: "Level 5",
    status: "Archived",
  },
];

const sampleRequests: ModuleRequest[] = [
  {
    code: "CS224N",
    title: "Natural Language Processing",
    institution: "Preview University",
    requestedBy: "Preview student",
  },
  {
    code: "ECO204",
    title: "Intermediate Microeconomics",
    institution: "Preview College",
    requestedBy: "Preview student",
  },
];

const sampleInstitutions: InstitutionEntry[] = [
  {
    id: "preview-university",
    name: "Preview University",
    type: "University",
    status: "Verified",
  },
  {
    id: "preview-college",
    name: "Preview College",
    type: "College",
    status: "Pending verification",
  },
];

const sampleRooms = [
  { id: "room-mat-01", code: "MAT2611", participants: 14, status: "Open" },
  { id: "room-cos-01", code: "COS1511", participants: 20, status: "Full" },
];

function AdminCatalogueScreen({
  onUnavailable,
  onModeration,
}: AdminCatalogueScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("catalogue");
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [createDialog, setCreateDialog] = useState<CreateDialog>(null);

  const filteredCatalogue = sampleCatalogue.filter((entry) =>
    `${entry.code} ${entry.title} ${entry.institution}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function confirmAction() {
    if (!confirmation) return;
    const messages: Record<NonNullable<Confirmation>["action"], string> = {
      delete: "Delete not completed: the catalogue service is not connected.",
      close: "Room not closed: the room service is not connected.",
      purge: "Purge not completed: the catalogue service is not connected.",
    };
    onUnavailable(messages[confirmation.action]);
    setConfirmation(null);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUnavailable(
      createDialog === "module"
        ? "Module not added: the catalogue service is not connected."
        : createDialog === "institution"
          ? "Institution not added: the catalogue service is not connected."
          : "Room not created: the room service is not connected.",
    );
    setCreateDialog(null);
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading admin-screen-heading">
        <div>
          <p className="eyebrow">Admin console / Catalogue</p>
          <h1>Module catalogue &amp; room governance</h1>
          <p className="screen-intro">
            Manage preview institutions, modules, student requests, and study
            rooms.
          </p>
        </div>
        <span className="preview-chip admin-preview-chip">
          <ShieldCheck size={14} aria-hidden="true" />
          Admin preview
        </span>
      </header>

      <section className="preview-banner" role="status">
        <ShieldCheck size={18} aria-hidden="true" />
        <p>
          Preview records only. Catalogue updates, request decisions, and room
          changes are not persisted.
        </p>
      </section>

      <section className="admin-summary-grid" aria-label="Preview summary">
        <article className="admin-summary-card">
          <span>
            <Building2 size={17} aria-hidden="true" />
            Institutions
          </span>
          <strong>{sampleInstitutions.length}</strong>
          <small>Preview institutions</small>
        </article>
        <article className="admin-summary-card">
          <span>
            <BookOpen size={17} aria-hidden="true" />
            Catalogue modules
          </span>
          <strong>148</strong>
          <small>Illustrative total</small>
        </article>
        <article className="admin-summary-card">
          <span>
            <FilePlus2 size={17} aria-hidden="true" />
            Pending requests
          </span>
          <strong>{sampleRequests.length}</strong>
          <small>Sample requests</small>
        </article>
        <article className="admin-summary-card">
          <span>
            <Users size={17} aria-hidden="true" />
            Active rooms
          </span>
          <strong>2</strong>
          <small>Sample rooms</small>
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
            aria-pressed={activeTab === "requests"}
            onClick={() => setActiveTab("requests")}
          >
            <FilePlus2 size={16} aria-hidden="true" />
            Module requests
            <span className="admin-tab-count">{sampleRequests.length}</span>
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
          <button
            type="button"
            className="admin-tab moderation-tab"
            onClick={onModeration}
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Forum moderation
          </button>
        </div>

        {activeTab === "catalogue" ? (
          <section aria-labelledby="catalogue-table-heading">
            <div className="admin-table-heading">
              <div>
                <h2 id="catalogue-table-heading">
                  Registered institutional module records
                </h2>
                <p>Sample records only; the DHET catalogue is not connected.</p>
              </div>
              <button
                className="primary-button action-button"
                type="button"
                onClick={() => setCreateDialog("module")}
              >
                <FilePlus2 size={16} aria-hidden="true" />
                Add module
              </button>
            </div>
            {createDialog === "module" && (
              <form className="admin-create-panel" onSubmit={handleCreate}>
                <div>
                  <h3>Add module to catalogue</h3>
                  <p>Preview form only; the catalogue service is not connected.</p>
                </div>
                <label className="form-field">
                  <span>Module code</span>
                  <input
                    name="code"
                    required
                    maxLength={24}
                    placeholder="e.g. MAT2611"
                  />
                </label>
                <label className="form-field">
                  <span>Module title</span>
                  <input
                    name="title"
                    required
                    maxLength={120}
                    placeholder="Module name"
                  />
                </label>
                <label className="form-field">
                  <span>Institution</span>
                  <select required defaultValue="">
                    <option value="" disabled>
                      Select an institution
                    </option>
                    <option>Preview University</option>
                    <option>Preview College</option>
                  </select>
                </label>
                <div className="admin-create-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setCreateDialog(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button action-button" type="submit">
                    Add module
                  </button>
                </div>
              </form>
            )}
            <label className="catalogue-search">
              <Search size={16} aria-hidden="true" />
              <span className="visually-hidden">Filter catalogue records</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter by code, institution, or title..."
              />
            </label>
            <div className="table-scroll admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Module code</th>
                    <th scope="col">Module title</th>
                    <th scope="col">Institution</th>
                    <th scope="col">Level</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalogue.length > 0 ? (
                    filteredCatalogue.map((entry) => (
                      <tr key={entry.code}>
                        <td>
                          <strong>{entry.code}</strong>
                        </td>
                        <td>{entry.title}</td>
                        <td>{entry.institution}</td>
                        <td>{entry.level}</td>
                        <td>
                          <span
                            className={`status-chip status-${entry.status.toLowerCase().replaceAll(" ", "-")}`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            {entry.status === "Pending verification" && (
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  onUnavailable(
                                    "Verification not saved: the catalogue service is not connected.",
                                  )
                                }
                              >
                                <CircleCheck size={14} aria-hidden="true" />
                                Verify
                              </button>
                            )}
                            {entry.status === "Archived" ? (
                              <>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    onUnavailable(
                                      "Restore not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  Restore
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  onClick={() =>
                                    setConfirmation({
                                      action: "purge",
                                      label: entry.code,
                                    })
                                  }
                                >
                                  Purge
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    onUnavailable(
                                      "Edit not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  onClick={() =>
                                    onUnavailable(
                                      "Archive not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  <Archive size={14} aria-hidden="true" />
                                  Archive
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  aria-label={`Delete ${entry.code}`}
                                  onClick={() =>
                                    setConfirmation({
                                      action: "delete",
                                      label: entry.code,
                                    })
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <span className="admin-empty-row">
                          No catalogue records match that filter.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <section
              className="institution-catalogue-section"
              aria-labelledby="institution-table-heading"
            >
              <div className="admin-table-heading">
                <div>
                  <h2 id="institution-table-heading">Institution records</h2>
                  <p>Preview institutions registered in the catalogue.</p>
                </div>
                <button
                  className="primary-button action-button"
                  type="button"
                  onClick={() => setCreateDialog("institution")}
                >
                  <Building2 size={16} aria-hidden="true" />
                  Add institution
                </button>
              </div>
              {createDialog === "institution" && (
                <form className="admin-create-panel institution-create-panel" onSubmit={handleCreate}>
                  <div>
                    <h3>Add institution to catalogue</h3>
                    <p>
                      Preview form only; the catalogue service is not connected.
                    </p>
                  </div>
                  <label className="form-field">
                    <span>Institution name</span>
                    <input
                      name="institution"
                      required
                      maxLength={120}
                      placeholder="Institution name"
                    />
                  </label>
                  <label className="form-field">
                    <span>Institution type</span>
                    <select required defaultValue="">
                      <option value="" disabled>
                        Select a type
                      </option>
                      <option>University</option>
                      <option>College</option>
                    </select>
                  </label>
                  <div className="admin-create-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setCreateDialog(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="primary-button action-button"
                      type="submit"
                    >
                      Add institution
                    </button>
                  </div>
                </form>
              )}
              <div className="table-scroll admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Institution</th>
                      <th scope="col">Type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleInstitutions.map((institution) => (
                      <tr key={institution.id}>
                        <td>
                          <strong>{institution.name}</strong>
                        </td>
                        <td>{institution.type}</td>
                        <td>
                          <span
                            className={`status-chip status-${institution.status.toLowerCase().replaceAll(" ", "-")}`}
                          >
                            {institution.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            {institution.status === "Pending verification" && (
                              <button
                                type="button"
                                className="text-button"
                                onClick={() =>
                                  onUnavailable(
                                    "Verification not saved: the catalogue service is not connected.",
                                  )
                                }
                              >
                                <CircleCheck size={14} aria-hidden="true" />
                                Verify
                              </button>
                            )}
                            {institution.status === "Archived" ? (
                              <>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    onUnavailable(
                                      "Restore not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  Restore
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  onClick={() =>
                                    setConfirmation({
                                      action: "purge",
                                      label: institution.name,
                                    })
                                  }
                                >
                                  Purge
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() =>
                                    onUnavailable(
                                      "Edit not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  onClick={() =>
                                    onUnavailable(
                                      "Archive not saved: the catalogue service is not connected.",
                                    )
                                  }
                                >
                                  <Archive size={14} aria-hidden="true" />
                                  Archive
                                </button>
                                <button
                                  type="button"
                                  className="text-button danger-text"
                                  aria-label={`Delete ${institution.name}`}
                                  onClick={() =>
                                    setConfirmation({
                                      action: "delete",
                                      label: institution.name,
                                    })
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        ) : activeTab === "requests" ? (
          <section aria-labelledby="requests-heading">
            <div className="admin-table-heading">
              <div>
                <h2 id="requests-heading">Student module requests</h2>
                <p>Approve &amp; Add is intended to add the module atomically.</p>
              </div>
            </div>
            <div className="table-scroll admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Module code</th>
                    <th scope="col">Requested title</th>
                    <th scope="col">Institution</th>
                    <th scope="col">Requested by</th>
                    <th scope="col">Status</th>
                    <th scope="col">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRequests.map((request) => (
                    <tr key={request.code}>
                      <td>
                        <strong>{request.code}</strong>
                      </td>
                      <td>{request.title}</td>
                      <td>{request.institution}</td>
                      <td>{request.requestedBy}</td>
                      <td>
                        <span className="status-chip status-pending">Pending</span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="text-button approve-text"
                            onClick={() =>
                              onUnavailable(
                                "Approve & Add not completed: the module-request service is not connected.",
                              )
                            }
                          >
                            Approve &amp; Add
                          </button>
                          <button
                            type="button"
                            className="text-button danger-text"
                            onClick={() =>
                              onUnavailable(
                                "Request not rejected: the module-request service is not connected.",
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section aria-labelledby="rooms-admin-heading">
            <div className="admin-table-heading">
              <div>
                <h2 id="rooms-admin-heading">Room governance</h2>
                <p>
                  Rooms have no schedule or automatic expiry in the MVP.
                </p>
              </div>
              <button
                className="primary-button action-button"
                type="button"
                onClick={() => setCreateDialog("room")}
              >
                <DoorOpen size={16} aria-hidden="true" />
                Create room
              </button>
            </div>
            {createDialog === "room" && (
              <form className="admin-create-panel room-create-panel" onSubmit={handleCreate}>
                <div>
                  <h3>Create study room</h3>
                  <p>Preview form only; the room service is not connected.</p>
                </div>
                <label className="form-field">
                  <span>Module</span>
                  <select required defaultValue="">
                    <option value="" disabled>
                      Select a module
                    </option>
                    <option>MAT2611</option>
                    <option>COS1511</option>
                  </select>
                </label>
                <div className="admin-create-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setCreateDialog(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button action-button" type="submit">
                    Create room
                  </button>
                </div>
              </form>
            )}
            <div className="admin-room-list">
              {sampleRooms.map((room) => (
                <article className="admin-room-row" key={room.id}>
                  <div className="room-module-tag">{room.code}</div>
                  <div>
                    <h3>{room.code} study room</h3>
                    <p>
                      {room.participants}/20 participants · {room.status}
                    </p>
                  </div>
                  <span
                    className={`room-state ${room.status === "Full" ? "is-full" : "is-open"}`}
                  >
                    {room.status}
                  </span>
                  <button
                    type="button"
                    className="text-button danger-text"
                    onClick={() =>
                      setConfirmation({ action: "close", label: room.code })
                    }
                  >
                    Close room
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>

      <section className="denied-state-preview">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <h2>Role protection</h2>
          <p>
            Admin routes are hidden from student preview and show an access
            denied state when opened without the admin preview role.
          </p>
        </div>
      </section>

      {confirmation && (
        <AdminConfirmDialog
          title={
            confirmation.action === "close"
              ? "Close this study room?"
              : "Permanently delete this record?"
          }
          description={`Confirm the ${confirmation.action} action for ${confirmation.label}. This preview will not save changes.`}
          confirmLabel={
            confirmation.action === "close"
              ? "Close room"
              : "Confirm delete"
          }
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}

export default AdminCatalogueScreen;
