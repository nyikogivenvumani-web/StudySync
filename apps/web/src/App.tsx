import { NAV_ITEMS } from "./lib/navigation.js";

function App() {
  return (
    <main className="app-shell">
      <header className="brand-header">
        <a className="brand" href="/" aria-label="StudySync home">
          StudySync
        </a>
        <span className="environment-label">Development</span>
      </header>
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">Your focused study space</p>
        <h1 id="welcome-title">StudySync is ready to build.</h1>
        <p>
          Find classmates studying your modules, focus together, and keep your
          study sessions on track.
        </p>
        <nav aria-label="Primary navigation">
          {NAV_ITEMS.filter((item) => !item.requiresAdmin).map((item) => (
            <a className="nav-link" href={item.path} key={item.id}>
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </a>
          ))}
        </nav>
      </section>
    </main>
  );
}

export default App;
