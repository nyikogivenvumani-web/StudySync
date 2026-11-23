import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App.js";

describe("StudySync application shell", () => {
  it("shows the welcome message and student navigation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "StudySync is ready to build." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /discover/i })).toHaveAttribute(
      "href",
      "/discover",
    );
    expect(
      screen.queryByRole("link", { name: /admin console/i }),
    ).not.toBeInTheDocument();
  });
});
