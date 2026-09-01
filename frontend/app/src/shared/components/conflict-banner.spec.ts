import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { ConflictBanner } from "./conflict-banner";

describe("ConflictBanner", () => {
  const title = "Version conflict";
  const message = "Someone else already saved a newer version of this record.";

  it("renders the given title as Banner's own heading", () => {
    render(createElement(ConflictBanner, { title, message }));

    const heading = screen.getByRole("heading", { name: title });
    expect(heading.textContent).toBe(title);
  });

  it("renders the given message as visible text, carried through as Banner's subtitle", () => {
    render(createElement(ConflictBanner, { title, message }));

    expect(screen.getByText(message)).not.toBeNull();
  });

  it("renders through Banner's own markup, carrying the banner landmark, rather than bespoke conflict markup", () => {
    render(createElement(ConflictBanner, { title, message }));

    expect(screen.getByRole("banner")).not.toBeNull();
  });
});
