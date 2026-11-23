import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, BookOpenCheck, Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup";

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const isPasswordReset = pathname === "/reset-password";

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

export default App;
