import { useState, useEffect, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, Plus, Save, Send } from "lucide-react";
import { fetchInstitutions, fetchModules, submitModuleRequest } from "../../lib/api.js";

type ModuleOption = {
  code: string;
  title: string;
  subject: string;
  peers?: number;
};

type ModuleRequest = {
  code: string;
  title: string;
  institution: string;
  status: "Pending" | "Approved" | "Rejected";
};

type ProfileScreenProps = {
  selectedModules: string[];
  onModulesChange: (modules: string[]) => void;
  onSave: () => void;
  onRequest: () => void;
  onDiscover: () => void;
};

const moduleOptions: ModuleOption[] = [
  {
    code: "MAT2611",
    title: "Linear Algebra II & Matrix Methods",
    subject: "Mathematics",
    peers: 14,
  },
  {
    code: "COS1511",
    title: "Introduction to Programming I",
    subject: "Computer Science",
    peers: 28,
  },
  {
    code: "ECS1501",
    title: "Economics IA: Microeconomics",
    subject: "Economics",
    peers: 9,
  },
];

const sampleRequests: ModuleRequest[] = [
  {
    code: "MATH-201",
    title: "Linear Algebra & Matrix Theory",
    institution: "Preview University",
    status: "Pending",
  },
  {
    code: "BIO-110",
    title: "Molecular & Cellular Biology",
    institution: "Preview University",
    status: "Approved",
  },
  {
    code: "ARCH-09",
    title: "Introduction to Spatial Design",
    institution: "Preview College",
    status: "Rejected",
  },
];

function ProfileScreen({
  selectedModules,
  onModulesChange,
  onSave,
  onRequest,
  onDiscover,
}: ProfileScreenProps) {
  const [institution, setInstitution] = useState("");
  const [institutionList, setInstitutionList] = useState<{ id: string; name: string }[]>([]);
  const [availableModules, setAvailableModules] = useState<ModuleOption[]>(moduleOptions);

  useEffect(() => {
    fetchInstitutions()
      .then((types) => setInstitutionList(types))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchModules(institution)
      .then((mods) => {
        if (mods.length > 0) setAvailableModules(mods);
      })
      .catch(() => {});
  }, [institution]);

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
    const code = formData.get("moduleCode") as string;
    const title = formData.get("moduleTitle") as string;
    if (code) {
      submitModuleRequest({
        code,
        title,
        institution_type: institution || "University",
      }).catch(() => {});
    }
    onRequest();
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
        <span className="preview-chip">Preview data</span>
      </header>

      <section className="preview-banner" role="status">
        <BookOpen size={18} aria-hidden="true" />
        <p>
          Sample catalogue and request data only. Supabase is not connected, so
          your changes will not be saved or submitted.
        </p>
      </section>

      <section className="workspace-card" aria-labelledby="institution-heading">
        <div className="section-heading">
          <div>
            <h2 id="institution-heading">Registered institution</h2>
            <p>Select the institution where you are enrolled.</p>
          </div>
          <span className="catalogue-label">DHET catalogue pending</span>
        </div>
        <label className="form-field">
          <span>Institution</span>
          <select
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          >
            <option value="">Select an institution</option>
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
                    {module.peers} peers studying now
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="save-row">
          <p>
            Your selections preview the modules used to filter discovery.
          </p>
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
                Submit an inline request for a module not shown in the preview
                catalogue.
              </p>
            </div>
          </div>
          <span className="inline-label">Inline form · no pop-up</span>
        </div>

        <form className="request-form" onSubmit={handleRequest}>
          <label className="form-field">
            <span>Institution</span>
            <select required defaultValue="">
              <option value="" disabled>
                Select an institution
              </option>
              <option value="preview-university">Preview University</option>
              <option value="preview-college">Preview College</option>
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

        <div className="request-list-header">
          <h3>Your module requests</h3>
          <span>Sample tracking entries</span>
        </div>
        <div className="table-scroll">
          <table className="request-table">
            <thead>
              <tr>
                <th scope="col">Module code</th>
                <th scope="col">Title</th>
                <th scope="col">Institution</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleRequests.map((request) => (
                <tr key={request.code}>
                  <td>{request.code}</td>
                  <td>{request.title}</td>
                  <td>{request.institution}</td>
                  <td>
                    <span
                      className={`status-chip status-${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button className="text-button continue-link" onClick={onDiscover}>
        Continue to room discovery
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default ProfileScreen;
