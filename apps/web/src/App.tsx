import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { NAV_ITEMS } from "./lib/navigation.js";
import DiscoverScreen from "./features/discover/DiscoverScreen.js";
import ProfileScreen from "./features/profile/ProfileScreen.js";
import ForumScreen from "./features/forum/ForumScreen.js";
import SilentRoomScreen from "./features/room/SilentRoomScreen.js";

type AuthMode = "login" | "signup";

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const isPasswordReset = pathname === "/reset-password";
  const isAuthRoute = pathname === "/" || isPasswordReset;
  const [selectedModules, setSelectedModules] = useState([
    "MAT2611",
    "COS1511",
  ]);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setNotice("");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, "", path);
    setPathname(path);
    setNotice("");
    setPasswordVisible(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      isPasswordReset
        ? "Password recovery is not available until Supabase Auth is connected."
        : "Authentication is not connected yet. Connect Supabase Auth to continue.",
    );
  }

  function selectAuthMode(mode: AuthMode) {
    setAuthMode(mode);
    setNotice("");
  }

  function showUnavailableMessage(message: string) {
    setNotice(message);
  }

  if (!isAuthRoute) {
    const activeScreen =
      pathname === "/discover"
        ? "discover"
        : pathname === "/forum"
          ? "forum"
          : pathname === "/room" || pathname.startsWith("/room/")
            ? "room"
            : "profile";
    const navigationItems = NAV_ITEMS.filter(
      (item) =>
        item.id === "discover" ||
        item.id === "room" ||
        item.id === "forum" ||
        item.id === "profile",
    );
    const roomId = pathname.split("/")[2] ?? "preview-room";
    const isClosedRoom = roomId.includes("closed");
    const forumModuleCode = selectedModules[0] ?? "MAT2611";

    return (
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <a
            className="workspace-brand"
            href="/discover"
            onClick={(event) => {
              event.preventDefault();
              navigate("/discover");
            }}
          >
            <BookOpenCheck size={21} aria-hidden="true" />
            <span>StudySync</span>
          </a>
          <div className="workspace-context">
            <span>Active workspace</span>
            <strong>Student preview</strong>
          </div>
          <StudentNavigation
            items={navigationItems}
            pathname={pathname}
            onNavigate={navigate}
          />
          <div className="sidebar-account">
            <span className="account-avatar" aria-hidden="true">
              <User size={17} />
            </span>
            <span>
              <strong>Preview student</strong>
              <small>Demo account</small>
            </span>
          </div>
        </aside>

        <div className="workspace-main">
          <header className="workspace-topbar">
            <div className="workspace-title">
              <BookOpenCheck size={18} aria-hidden="true" />
              <span>Student module workspace</span>
            </div>
            <span className="connection-chip">
              <span className="connection-dot" aria-hidden="true" />
              Preview mode
            </span>
          </header>

          <main className="workspace-content">
            {notice && (
              <p className="workspace-notice" role="status">
                <AlertCircle size={17} aria-hidden="true" />
                {notice}
              </p>
            )}
            {activeScreen === "profile" ? (
              <ProfileScreen
                selectedModules={selectedModules}
                onModulesChange={setSelectedModules}
                onSave={() =>
                  showUnavailableMessage(
                    "Preview only: selections have not been saved to your account.",
                  )
                }
                onRequest={() =>
                  showUnavailableMessage(
                    "Request not submitted: module requests need the Supabase connection.",
                  )
                }
                onDiscover={() => navigate("/discover")}
              />
            ) : activeScreen === "discover" ? (
              <DiscoverScreen
                selectedModules={selectedModules}
                onEditProfile={() => navigate("/profile")}
                onJoinRoom={() =>
                  showUnavailableMessage(
                    "Room joining is not connected yet. No seat has been reserved.",
                  )
                }
                onViewChecklist={(closedRoomId) =>
                  navigate(`/room/${closedRoomId}`)
                }
              />
            ) : activeScreen === "room" ? (
              <SilentRoomScreen
                roomId={roomId}
                isClosed={isClosedRoom}
                onDiscover={() => navigate("/discover")}
                onForum={() => navigate("/forum")}
                onUnavailable={showUnavailableMessage}
              />
            ) : (
              <ForumScreen
                moduleCode={forumModuleCode}
                onUnavailable={showUnavailableMessage}
              />
            )}
          </main>

          <StudentNavigation
            items={navigationItems}
            pathname={pathname}
            onNavigate={navigate}
            mobile
          />
        </div>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <div className="brand-mark" aria-hidden="true">
            <BookOpenCheck size={22} strokeWidth={2} />
          </div>
          <p className="brand-name">StudySync</p>
          <p className="brand-tagline">
            Focused study session &amp; module collaboration
          </p>
        </header>

        {isPasswordReset ? (
          <div className="reset-heading">
            <h1 id="auth-title">Reset your password</h1>
            <p>Enter your email address and we’ll help you get back in.</p>
          </div>
        ) : (
          <>
            <h1 className="visually-hidden" id="auth-title">
              Access your StudySync account
            </h1>
            <div className="auth-tabs" role="group" aria-label="Account options">
              <button
                type="button"
                aria-pressed={authMode === "login"}
                className="auth-tab"
                onClick={() => selectAuthMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                aria-pressed={authMode === "signup"}
                className="auth-tab"
                onClick={() => selectAuthMode("signup")}
              >
                Sign up
              </button>
            </div>
          </>
        )}

        <form
          id="auth-form"
          className="auth-form"
          onSubmit={handleSubmit}
          aria-label={isPasswordReset ? "Reset password" : authMode}
        >
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="student@example.com"
              required
            />
          </div>

          {!isPasswordReset && (
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                {authMode === "login" && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => navigate("/reset-password")}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  aria-pressed={passwordVisible}
                  onClick={() => setPasswordVisible((visible) => !visible)}
                >
                  {passwordVisible ? (
                    <EyeOff size={17} aria-hidden="true" />
                  ) : (
                    <Eye size={17} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          )}

          {notice && (
            <p className="auth-notice" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{notice}</span>
            </p>
          )}

          <button className="primary-button" type="submit">
            {isPasswordReset
              ? "Send reset link"
              : authMode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <footer className="auth-footer">
          {isPasswordReset ? (
            <button
              className="text-button back-to-login"
              type="button"
              onClick={() => navigate("/")}
            >
              Back to log in
            </button>
          ) : (
            <p>Sign in with your StudySync student account.</p>
          )}
        </footer>
      </section>
    </main>
  );
}

type StudentNavigationProps = {
  items: typeof NAV_ITEMS;
  pathname: string;
  onNavigate: (path: string) => void;
  mobile?: boolean;
};

function StudentNavigation({
  items,
  pathname,
  onNavigate,
  mobile = false,
}: StudentNavigationProps) {
  return (
    <nav
      className={mobile ? "mobile-navigation" : "student-navigation"}
      aria-label="Student navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isCurrent =
          pathname === item.path ||
          (item.id === "room" && pathname.startsWith("/room/"));
        return (
          <a
            className={`student-nav-link${isCurrent ? " is-current" : ""}`}
            href={item.path}
            key={item.id}
            aria-current={isCurrent ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.path);
            }}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default App;
