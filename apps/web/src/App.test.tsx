import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App.js";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("StudySync screens", () => {
  it("renders the login form without signed-in navigation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Access your StudySync account" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("switches between login and sign-up forms", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      within(screen.getByRole("group", { name: "Account options" })).getByRole(
        "button",
        { name: "Sign up" },
      ),
    );

    expect(screen.getByRole("button", { name: "Create account" })).toBeVisible();
    expect(
      within(screen.getByRole("group", { name: "Account options" })).getByRole(
        "button",
        { name: "Sign up" },
      ),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("button", { name: "Forgot password?" }),
    ).not.toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<App />);
    const password = screen.getByLabelText("Password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("opens password recovery and returns to login", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect(
      screen.getByRole("heading", { name: "Reset your password" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/reset-password");

    await user.click(screen.getByRole("button", { name: "Back to log in" }));

    expect(
      within(screen.getByRole("group", { name: "Account options" })).getByRole(
        "button",
        { name: "Log in" },
      ),
    ).toBeVisible();
    expect(window.location.pathname).toBe("/");
  });

  it("reports missing configuration instead of pretending to sign in", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Email address"), "student@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(
      within(screen.getByRole("form", { name: "login" })).getByRole("button", {
        name: "Log in",
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "StudySync is not configured",
    );
  });

  it("reports missing configuration for password recovery", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Email address"), "student@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "StudySync is not configured",
    );
  });
});
