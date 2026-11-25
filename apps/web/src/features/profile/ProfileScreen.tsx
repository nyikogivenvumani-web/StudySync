import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Plus, Save, Send } from "lucide-react";
import { submitModuleRequest, type ModuleOption } from "../../lib/api.js";

type ProfileScreenProps = {
  modules: ModuleOption[];
  selectedModules: string[];
  institutionType: "College" | "University" | null;
  onModulesChange: (modules: string[]) => void;
  onSave: () => void;
  onRequest: (message: string) => void;
  onDiscover: () => void;
};

function ProfileScreen({
  modules,
  selectedModules,
  institutionType,
  onModulesChange,
  onSave,
  onRequest,
  onDiscover,
}: ProfileScreenProps) {
  const [institution, setInstitution] = useState<string>(institutionType ?? "");
  const availableModules = institution
    ? modules.filter((m) => m.institution_type === institution)
    : modules;

  function toggleModule(code: string) {
    const updatedModules = selectedModules.includes(code)
      ? selectedModules.filter((selectedCode) => selectedCode !== code)
      : [...selectedModules, code];
    onModulesChange(updatedModules);
  }

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const code = String(formData.get("moduleCode") ?? "");
    const title = String(formData.get("moduleTitle") ?? "");
    const type = String(formData.get("requestInstitution") ?? "University");
    submitModuleRequest({
      code,
      title,
      institution_type: type === "College" ? "College" : "University",
    })
      .then(() => {
        form.reset();
        onRequest("Module request submitted. An admin will review it.");
      })
      .catch((err: Error) => onRequest(err.message));
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
          <span>Institution</span>
          <select
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          >
            <option value="">Select an institution</option>
            <option value="University">University</option>
            <option value="College">College</option>
          </select>
        </label>
      </section>

      <section className="workspace-card" aria-labelledby="modules-heading">
        <div className="section-heading">
          <div>
            <h2 id="modules-heading">Active modules</h2>
            <p>Select the modules you are currently studying.</p>
          </div>
          <span className="selection-count">
            {selectedModules.length} selected
          </span>
        </div>

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
                  <span className="module-peer-count">
                    <Check size={14} aria-hidden="true" />
                    {module.institution_type}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="save-row">
          <p>Your selections filter room discovery.</p>
          <button className="primary-button action-button" onClick={onSave}>
            <Save size={16} aria-hidden="true" />
            Save selections
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
                Submit a request for a module that is not in the catalogue.
              </p>
            </div>
          </div>
          <span className="inline-label">Inline form · no pop-up</span>
        </div>

        <form className="request-form" onSubmit={handleRequest}>
          <label className="form-field">
            <span>Institution</span>
            <select name="requestInstitution" required defaultValue={institutionType ?? "University"}>
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
          <button className="secondary-button request-submit" type="submit">
            <Send size={15} aria-hidden="true" />
            Submit request
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
