import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  Eye,
  EyeOff,
  LogOut,
  User,
} from "lucide-react";
import { NAV_ITEMS } from "./lib/navigation.js";
import { supabase } from "./lib/supabase.js";
import AdminCatalogueScreen from "./features/admin/AdminCatalogueScreen.js";
import ForumModerationScreen from "./features/admin/ForumModerationScreen.js";
import DiscoverScreen from "./features/discover/DiscoverScreen.js";
import ProfileScreen from "./features/profile/ProfileScreen.js";
import ForumScreen from "./features/forum/ForumScreen.js";
import { fetchModules, fetchProfile, type ModuleOption, type Profile } from "./lib/api.js";
import SilentRoomScreen from "./features/room/SilentRoomScreen.js";

type AuthMode = "login" | "signup";

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [catalogue, setCatalogue] = useState<ModuleOption[]>([]);
  const isPasswordReset = pathname === "/reset-password";
  const isAuthRoute = pathname === "/" || isPasswordReset;
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setAuthLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const loadCatalogue = useCallback(() => {
    fetchModules()
      .then(setCatalogue)
      .catch(() => setNotice("Could not load the module catalogue."));
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setSelectedModules([]);
      return;
    }
    fetchProfile()
      .then(setProfile)
      .catch(() => setNotice("Could not load your profile."));
    loadCatalogue();
    try {
      const saved = localStorage.getItem(`studysync:modules:${userId}`);
      setSelectedModules(saved ? (JSON.parse(saved) as string[]) : []);
    } catch {
      setSelectedModules([]);
    }
  }, [userId, loadCatalogue]);

  function saveSelections() {
    try {
      localStorage.setItem(`studysync:modules:${userId}`, JSON.stringify(selectedModules));
      setNotice("Your active modules were saved on this device.");
    } catch {
      setNotice("Could not save your selections.");
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    navigate("/");
  }

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!supabase) {
      setNotice("StudySync is not configured: the Supabase environment variables are missing.");
      return;
    }

    try {
      if (isPasswordReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If your email is registered, a password reset link has been sent.");
      } else if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate("/discover");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/discover");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setNotice(message);
    }
  }

  function selectAuthMode(mode: AuthMode) {
    setAuthMode(mode);
    setNotice("");
  }

  function showUnavailableMessage(message: string) {
    setNotice(message);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!userId && !isAuthRoute) navigate("/");
    else if (userId && pathname === "/") navigate("/discover");
  }, [authLoading, userId, pathname]);

  if (!isAuthRoute && (authLoading || !userId)) {
    return (
      <main className="auth-page">
        <p role="status">Loading StudySync…</p>
      </main>
    );
  }

  if (!isAuthRoute) {
    const isAdminRoute = pathname.startsWith("/admin");
    const hasAdminAccess = profile?.role === "admin";
    const activeScreen = isAdminRoute
      ? pathname === "/admin/moderation"
        ? "moderation"
        : "admin"
      : pathname === "/discover"
        ? "discover"
        : pathname === "/forum"
          ? "forum"
          : pathname === "/room" || pathname.startsWith("/room/")
            ? "room"
            : "profile";
    const navigationItems = NAV_ITEMS.filter(
      (item) =>
        (item.requiresAdmin ? hasAdminAccess : true) &&
        (item.id === "discover" ||
          item.id === "room" ||
          item.id === "forum" ||
          item.id === "profile" ||
          item.id === "admin"),
    );
    const roomId = pathname.split("/")[2] ?? "";
    const forumModules = catalogue.filter((m) => selectedModules.includes(m.code));

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
            <span>Signed in as</span>
            <strong>{hasAdminAccess ? "Admin" : "Student"}</strong>
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
              <strong>{profile?.email ?? "Your account"}</strong>
              <small>{hasAdminAccess ? "Administrator" : "Student"}</small>
            </span>
            <button
              type="button"
              className="text-button"
              aria-label="Sign out"
              onClick={signOut}
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <div className="workspace-main">
          <header className="workspace-topbar">
            <div className="workspace-title">
              <BookOpenCheck size={18} aria-hidden="true" />
              <span>
                {isAdminRoute
                  ? "Admin management workspace"
                  : "Student module workspace"}
              </span>
            </div>
            <div className="topbar-actions">
            </div>
          </header>

          <main className="workspace-content">
            {notice && (
              <p className="workspace-notice" role="status">
                <AlertCircle size={17} aria-hidden="true" />
                {notice}
              </p>
            )}
            {isAdminRoute && !hasAdminAccess ? (
              <section className="denied-access-card" role="alert">
                <AlertCircle size={23} aria-hidden="true" />
                <div>
                  <p className="eyebrow">Admin-only area</p>
                  <h1>You don't have permission to access this page.</h1>
                  <p>These screens are available to administrators only.</p>
                </div>
              </section>
            ) : activeScreen === "admin" ? (
              <AdminCatalogueScreen
                modules={catalogue}
                onModulesChanged={loadCatalogue}
                onUnavailable={showUnavailableMessage}
                onModeration={() => navigate("/admin/moderation")}
              />
            ) : activeScreen === "moderation" ? (
              <ForumModerationScreen
                modules={catalogue}
                currentUserId={userId ?? ""}
                onUnavailable={showUnavailableMessage}
                onCatalogue={() => navigate("/admin")}
              />
            ) : activeScreen === "profile" ? (
              <ProfileScreen
                modules={catalogue}
                selectedModules={selectedModules}
                institutionType={profile?.institution_type ?? null}
                onModulesChange={setSelectedModules}
                onSave={saveSelections}
                onRequest={showUnavailableMessage}
                onDiscover={() => navigate("/discover")}
              />
            ) : activeScreen === "discover" ? (
              <DiscoverScreen
                selectedModules={selectedModules}
                onEditProfile={() => navigate("/profile")}
                onJoinRoom={(id) => navigate(`/room/${id}`)}
                onViewChecklist={(closedRoomId) =>
                  navigate(`/room/${closedRoomId}`)
                }
              />
            ) : activeScreen === "room" ? (
              roomId ? (
                <SilentRoomScreen
                  key={roomId}
                  roomId={roomId}
                  currentUserId={userId ?? ""}
                  onDiscover={() => navigate("/discover")}
                  onForum={() => navigate("/forum")}
                  onUnavailable={showUnavailableMessage}
                />
              ) : (
                <section className="empty-state">
                  <h2>Pick a room to join</h2>
                  <button
                    className="primary-button action-button"
                    onClick={() => navigate("/discover")}
                  >
                    Browse study rooms
                  </button>
                </section>
              )
            ) : (
              <ForumScreen
                key={forumModules.map((m) => m.code).join(",")}
                modules={forumModules}
                currentUserId={userId ?? ""}
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
      aria-label="Workspace navigation"
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
