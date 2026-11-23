import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App.js";

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("StudySync authentication screen", () => {
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

  it("does not claim authentication succeeded without an auth service", async () => {
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
      "Authentication is not connected yet.",
    );
  });

  it("reports that password recovery is not connected", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));
    await user.type(screen.getByLabelText("Email address"), "student@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password recovery is not available until Supabase Auth is connected.",
    );
  });

  it("renders the profile selections and previews save feedback", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/profile");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Student module profile" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /MAT2611/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /ECS1501/ })).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Save selections" }));

    expect(screen.getByText(/selections have not been saved/i)).toBeInTheDocument();
  });

  it("keeps module requests inline and does not pretend to submit them", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/profile");
    render(<App />);

    const institutionSelects = screen.getAllByLabelText("Institution");
    await user.selectOptions(institutionSelects[1], "preview-university");
    await user.type(screen.getByLabelText("Module code"), "CS224N");
    await user.click(screen.getByRole("button", { name: "Submit request" }));

    expect(
      screen.getByText(/Request not submitted: module requests need the Supabase connection/),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your module requests" })).toBeVisible();
  });

  it("filters sample rooms by selected modules and keeps full rooms unavailable", () => {
    window.history.replaceState({}, "", "/discover");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Study room discovery" }),
    ).toBeInTheDocument();
    expect(screen.getByText("MAT2611", { selector: ".module-chip" })).toBeVisible();
    expect(screen.queryByText("Economics IA: Microeconomics")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Room full (20/20)" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "View checklist" })).toBeVisible();
  });

  it("explains that joining a preview room does not reserve a seat", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/discover");
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Join room" })[0]);

    expect(
      screen.getByText(/No seat has been reserved/),
    ).toBeInTheDocument();
  });

  it("shows a clear empty state when no modules are selected", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/profile");
    render(<App />);

    await user.click(screen.getByRole("checkbox", { name: /MAT2611/ }));
    await user.click(screen.getByRole("checkbox", { name: /COS1511/ }));
    await user.click(screen.getByRole("button", { name: "Continue to room discovery" }));

    expect(
      screen.getByRole("heading", { name: "Choose modules to see study rooms" }),
    ).toBeVisible();
  });
});
