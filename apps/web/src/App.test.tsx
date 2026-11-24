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

  it("renders a student room preview with a read-only synchronized-timer shell", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/room");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Silent study room" }),
    ).toBeInTheDocument();
    expect(screen.getByText("50:00")).toBeVisible();
    expect(screen.getByText(/Microphones are disabled/)).toBeVisible();
    expect(screen.getByLabelText("Your study status")).toHaveAttribute(
      "maxLength",
      "60",
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: /Mark incomplete: Complete practice questions/,
      }),
    );

    expect(screen.getByText(/checklist changes are not saved/)).toBeInTheDocument();
  });

  it("opens closed-room checklists in read-only mode", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/discover");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "View checklist" }));

    expect(window.location.pathname).toBe("/room/room-cos-closed");
    expect(screen.getByRole("heading", { name: "This room is closed" })).toBeVisible();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Study timer" })).not.toBeInTheDocument();
  });

  it("renders the module forum and reports that posts are not published", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/forum");
    render(<App />);

    expect(screen.getByRole("heading", { name: "Module forum" })).toBeVisible();
    expect(screen.getByText("Pinned notice")).toBeVisible();
    expect(screen.getByText("Edited")).toBeVisible();

    await user.type(
      screen.getByRole("textbox", { name: "New post text" }),
      "Study session reminder",
    );
    await user.click(screen.getByRole("button", { name: "Publish notice" }));

    expect(screen.getByText(/Post not published/)).toBeInTheDocument();
  });

  it("supports editing the current preview student's post without saving it", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/forum");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("textbox", { name: "Edit post text" })).toHaveValue(
      "I am reviewing Section 1.4 before the next study block. The worked examples are helpful.",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText(/Edit not saved/)).toBeInTheDocument();
  });

  it("denies student preview access to admin routes and allows admin preview", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/admin");
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "You don't have permission to access this page.",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: "Admin Console" }),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");

    expect(
      screen.getByRole("heading", {
        name: "Module catalogue & room governance",
      }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: "Admin Console" })[0],
    ).toBeVisible();
  });

  it("previews catalogue request review and confirms closing a room", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/admin");
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");

    await user.click(screen.getByRole("button", { name: /Module requests/ }));
    expect(
      screen.getByRole("heading", { name: "Student module requests" }),
    ).toBeVisible();
    await user.click(screen.getAllByRole("button", { name: "Reject" })[0]);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(/Request not rejected/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rooms" }));
    await user.click(screen.getAllByRole("button", { name: "Close room" })[0]);
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Close this study room?",
    );
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Close room",
      }),
    );
    expect(screen.getByText(/Room not closed/)).toBeInTheDocument();
  });

  it("shows institution catalogue records and preview-only add form", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/admin");
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");

    expect(
      screen.getByRole("heading", { name: "Institution records" }),
    ).toBeVisible();
    expect(screen.getAllByText("Preview University").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Add institution" }));
    await user.type(
      screen.getByLabelText("Institution name"),
      "Example Institute",
    );
    await user.selectOptions(screen.getByLabelText("Institution type"), "College");
    await user.click(
      screen.getAllByRole("button", { name: "Add institution" })[1],
    );

    expect(screen.getByText(/Institution not added/)).toBeInTheDocument();
  });

  it("reflects admin pin changes in the student forum preview", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/admin/moderation");
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");

    await user.click(
      screen.getAllByRole("button", { name: "Pin announcement" })[0],
    );
    expect(screen.getByText(/now pinned in this browser session/)).toBeInTheDocument();
    await user.click(screen.getAllByRole("link", { name: "Group Forum" })[0]);

    expect(screen.getAllByText("Pinned notice")).toHaveLength(2);
  });

  it("removes a post from the student forum preview after confirmation", async () => {
    const user = userEvent.setup();
    window.history.replaceState({}, "", "/admin/moderation");
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");

    const peerPost = screen
      .getByText(
        "Shared notes for Gaussian elimination have been updated in the course resources.",
      )
      .closest("article");
    expect(peerPost).not.toBeNull();
    if (!peerPost) return;
    await user.click(
      within(peerPost).getByRole("button", { name: "Remove post" }),
    );
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Remove post",
      }),
    );
    await user.click(screen.getAllByRole("link", { name: "Group Forum" })[0]);

    expect(
      screen.queryByText(
        "Shared notes for Gaussian elimination have been updated in the course resources.",
      ),
    ).not.toBeInTheDocument();
  });
});
