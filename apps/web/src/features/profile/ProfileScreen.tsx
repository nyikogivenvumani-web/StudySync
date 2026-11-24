import { useState, useEffect, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, Plus, Save, Send } from "lucide-react";
import { fetchInstitutions, fetchModules, submitModuleRequest } from "../../lib/api.js";

type ModuleOption = {
  code: string;
  title: string;
  subject: string;
  peers?: number;
};

type ProfileScreenProps = {
  selectedModules: string[];
  onModulesChange: (modules: string[]) => void;
  onSave: () => void;
  onRequest: () => void;
  onDiscover: () => void;
};

function ProfileScreen({
  selectedModules,
  onModulesChange,
  onSave,
  onRequest,
  onDiscover,
}: ProfileScreenProps) {
  const [institution, setInstitution] = useState("");
  const [institutionList, setInstitutionList] = useState<{ id: string; name: string }[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    fetchInstitutions()
      .then((types) => setInstitutionList(types))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchModules(institution || undefined)
      .then((mods) => {
        setAvailableModules(mods);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [institution]);

  function toggleModule(code: string) {
    const updatedModules = selectedModules.includes(code)
      ? selectedModules.filter((selectedCode) => selectedCode !== code)
      : [...selectedModules, code];
    onModulesChange(updatedModules);
  }

  function handleSave() {
    setSaveStatus("saved");
    onSave();
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const code = formData.get("moduleCode") as string;
    const title = formData.get("moduleTitle") as string;
    if (!code) return;

    setRequestStatus("submitting");
    submitModuleRequest({
      code,
      title,
      institution_type: institution || "University",
    })
      .then(() => {
        setRequestStatus("done");
        form.reset();
        setTimeout(() => setRequestStatus("idle"), 3000);
        onRequest();
      })
      .catch(() => {
        setRequestStatus("error");
        setTimeout(() => setRequestStatus("idle"), 3000);
      });
  }

  return (
    <div className="screen-stack">
      <header className="screen-heading">
        <div>
          <p className="eyebrow">Student workspace / Profile</p>
          <h1>Student module profile</h1>
          <p className="screen-intro">
            Choose your institution and active modules to personalize room
            discovery.
          </p>
        </div>
      </header>

      <section className="workspace-card" aria-labelledby="institution-heading">
        <div className="section-heading">
          <div>
            <h2 id="institution-heading">Registered institution</h2>
            <p>Select the institution where you are enrolled.</p>
          </div>
        </div>
        <label className="form-field">
          <span>Institution type</span>
          <select
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          >
            <option value="">All institutions</option>
            {institutionList.length > 0 ? (
              institutionList.map((inst) => (
                <option value={inst.id} key={inst.id}>
                  {inst.name}
                </option>
              ))
            ) : (
              <>
                <option value="University">University</option>
                <option value="College">College</option>
              </>
            )}
          </select>
        </label>
      </section>

      <section className="workspace-card" aria-labelledby="modules-heading">
        <div className="section-heading">
          <div>
            <h2 id="modules-heading">Active modules</h2>
            <p>Select the modules you are currently studying.</p>
          </div>
          <span className="catalogue-label">{selectedModules.length} selected</span>
        </div>

        {loading ? (
          <p className="panel-helper">Loading modules…</p>
        ) : availableModules.length === 0 ? (
          <p className="panel-helper">No modules found. Try a different institution type.</p>
        ) : (
          <fieldset className="module-grid">
            <legend className="visually-hidden">Select active modules</legend>
            {availableModules.map((module) => {
              const isSelected = selectedModules.includes(module.code);
              return (
                <label
                  className={`module-option${isSelected ? " is-selected" : ""}`}
                  key={module.code}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleModule(module.code)}
                  />
                  <span className="module-option-content">
                    <span className="module-option-title">
                      <strong>{module.code}</strong>
                      <span className="subject-tag">{module.subject}</span>
                    </span>
                    <span className="module-description">{module.title}</span>
                    {module.peers !== undefined && (
                      <span className="module-peer-count">
                        <Check size={14} aria-hidden="true" />
                        {module.peers} peers studying now
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}

        <div className="save-row">
          <p>
            {saveStatus === "saved"
              ? "✓ Selections saved to your session."
              : "Save your module selections to filter room discovery."}
          </p>
          <button className="primary-button action-button" onClick={handleSave}>
            <Save size={16} aria-hidden="true" />
            {saveStatus === "saved" ? "Saved!" : "Save selections"}
          </button>
        </div>
      </section>

      <section className="request-panel" aria-labelledby="request-heading">
        <div className="section-heading">
          <div className="request-title">
            <span className="section-icon" aria-hidden="true">
              <Plus size={17} />
            </span>
            <div>
              <h2 id="request-heading">Request a missing module</h2>
              <p>
                Submit a request for a module not shown in the catalogue.
              </p>
            </div>
          </div>
          <span className="inline-label">Inline form · no pop-up</span>
        </div>

        <form className="request-form" onSubmit={handleRequest}>
          <label className="form-field">
            <span>Institution type</span>
            <select
              name="institutionType"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select an institution type
              </option>
              <option value="University">University</option>
              <option value="College">College</option>
            </select>
          </label>
          <label className="form-field">
            <span>Module code</span>
            <input
              name="moduleCode"
              placeholder="e.g. CS-224N"
              required
              maxLength={24}
            />
          </label>
          <label className="form-field">
            <span>
              Module title <span className="optional-label">Optional</span>
            </span>
            <input
              name="moduleTitle"
              placeholder="e.g. Natural Language Processing"
              maxLength={120}
            />
          </label>
          {requestStatus === "done" && (
            <p className="panel-helper" role="status">
              <BookOpen size={14} aria-hidden="true" /> Request submitted successfully.
            </p>
          )}
          {requestStatus === "error" && (
            <p className="panel-helper" role="alert" style={{ color: "var(--color-error, #dc2626)" }}>
              Failed to submit request. Please try again.
            </p>
          )}
          <button
            className="secondary-button request-submit"
            type="submit"
            disabled={requestStatus === "submitting"}
          >
            <Send size={15} aria-hidden="true" />
            {requestStatus === "submitting" ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </section>

      <button className="text-button continue-link" onClick={onDiscover}>
        Continue to room discovery
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default ProfileScreen;
