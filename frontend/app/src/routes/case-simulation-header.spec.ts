import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { mountCaseSimulationHeader } from "./case-simulation-header.test-support";
import type { CaseSimulationHeaderProps } from "./case-simulation-header";

function baseProps(
  overrides: Partial<CaseSimulationHeaderProps> = {},
): CaseSimulationHeaderProps {
  return {
    slug: "some-slug",
    version: 3,
    whenToUse: "Use when the customer disputes a charge",
    versionState: "draft",
    canSimulate: false,
    onSimulateCase: vi.fn(),
    ...overrides,
  };
}

describe("CaseSimulationHeader -- the version's own identity (the task's own objective)", () => {
  it("shows the given slug and version as 'slug · vN'", async () => {
    await mountCaseSimulationHeader(baseProps({ slug: "some-slug", version: 3 }));

    expect(screen.getByText("some-slug · v3")).toBeTruthy();
  });
});

describe("CaseSimulationHeader -- the version's own state pill (criterion 3)", () => {
  it("shows a draft version's state as 'Draft', paired with the app's own bg-warning convention", async () => {
    await mountCaseSimulationHeader(baseProps({ versionState: "draft" }));

    expect(screen.getByText("Draft")).toBeTruthy();

    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(document.querySelector(".bg-warning")).not.toBeNull();
  });

  it("shows a released version's state as 'Released', paired with the app's own bg-success convention", async () => {
    await mountCaseSimulationHeader(baseProps({ versionState: "released" }));

    expect(screen.getByText("Released")).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- see this file's own comment above on the decorative, aria-hidden state dot
    expect(document.querySelector(".bg-success")).not.toBeNull();
    expect(screen.queryByText("Draft")).toBeNull();
  });
});

describe("CaseSimulationHeader -- the version's own when_to_use text (criterion 4)", () => {
  it("shows the given whenToUse text", async () => {
    await mountCaseSimulationHeader(
      baseProps({ whenToUse: "Use only for a first-time billing dispute" }),
    );

    expect(screen.getByText(/Use only for a first-time billing dispute/)).toBeTruthy();
  });
});

describe("CaseSimulationHeader -- the 'Edit version' link (criterion 5)", () => {
  it("targets the version screen directly when the version is draft", async () => {
    await mountCaseSimulationHeader(
      baseProps({ slug: "some-slug", version: 3, versionState: "draft" }),
    );

    const link = screen.getByRole("link", { name: "Edit version" });
    expect(link.getAttribute("href")).toBe("/cases/some-slug/versions/3");
  });

  it("targets creating a draft from this version, addressed by its own number, when the version is released", async () => {
    await mountCaseSimulationHeader(
      baseProps({ slug: "some-slug", version: 6, versionState: "released" }),
    );

    const link = screen.getByRole("link", { name: "Edit version" });
    const url = new URL(link.getAttribute("href") ?? "", "http://localhost");
    expect(url.pathname).toBe("/cases/some-slug/versions/new");
    expect(url.searchParams.get("sourceVersion")).toBe("6");
  });
});

describe("CaseSimulationHeader -- the 'Manifest' link (criterion 6)", () => {
  it("targets the manifest screen for this version when the version is draft", async () => {
    await mountCaseSimulationHeader(
      baseProps({ slug: "some-slug", version: 3, versionState: "draft" }),
    );

    const link = screen.getByRole("link", { name: "Manifest" });
    expect(link.getAttribute("href")).toBe("/cases/some-slug/versions/3/manifest");
  });

  it("targets the manifest screen for this version when the version is released, same as when it is draft", async () => {
    await mountCaseSimulationHeader(
      baseProps({ slug: "some-slug", version: 6, versionState: "released" }),
    );

    const link = screen.getByRole("link", { name: "Manifest" });
    expect(link.getAttribute("href")).toBe("/cases/some-slug/versions/6/manifest");
  });
});

describe("CaseSimulationHeader -- 'Edit version' and 'Manifest' render as plain links (this task's own recorded inference)", () => {
  it("exposes both as role \"link\", with no role \"button\" carrying either name", async () => {
    await mountCaseSimulationHeader(baseProps());

    expect(screen.getByRole("link", { name: "Edit version" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Manifest" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit version" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Manifest" })).toBeNull();
  });
});

describe("CaseSimulationHeader -- the 'Simulate case' control (criterion 7)", () => {
  it("is disabled when the caller's canSimulate prop is false", async () => {
    await mountCaseSimulationHeader(baseProps({ canSimulate: false }));

    const button = screen.getByRole("button", { name: /Simulate case/ });
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("is enabled when the caller's canSimulate prop is true, rather than the header computing its own readiness", async () => {
    await mountCaseSimulationHeader(baseProps({ canSimulate: true }));

    const button = screen.getByRole("button", { name: /Simulate case/ });
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("calls exactly the caller's own onSimulateCase when clicked, rather than a handler the header computes itself", async () => {
    const onSimulateCase = vi.fn();
    await mountCaseSimulationHeader(baseProps({ canSimulate: true, onSimulateCase }));

    fireEvent.click(screen.getByRole("button", { name: /Simulate case/ }));

    expect(onSimulateCase).toHaveBeenCalledTimes(1);
  });
});
