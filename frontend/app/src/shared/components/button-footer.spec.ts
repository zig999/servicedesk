import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppShell } from "./app-shell";
import { ButtonFooter } from "./button-footer";

function ScreenWithFooter() {
  return createElement(
    "div",
    null,
    createElement("p", null, "Screen content"),
    createElement(ButtonFooter, null, createElement("button", null, "Save")),
  );
}

function buildFooterTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: AppShell });
  const casesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: ScreenWithFooter,
  });
  const routeTree = rootRoute.addChildren([casesRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

describe("ButtonFooter", () => {
  it("renders each given child in the order it received them", () => {
    render(
      createElement(
        ButtonFooter,
        null,
        createElement("button", { key: "first" }, "First"),
        createElement("button", { key: "second" }, "Second"),
        createElement("button", { key: "third" }, "Third"),
      ),
    );

    const group = screen.getByRole("group", { name: "Actions" });
    const labels = within(group).getAllByRole("button").map((button) => button.textContent);
    expect(labels).toEqual(["First", "Second", "Third"]);
  });

  it("exposes its root as an accessible group named Actions", () => {
    render(createElement(ButtonFooter, null, createElement("button", null, "Save")));

    expect(screen.getByRole("group", { name: "Actions" })).toBeTruthy();
  });

  it("lays its children out as a row aligned to the end", () => {
    render(createElement(ButtonFooter, null, createElement("button", null, "Save")));

    const group = screen.getByRole("group", { name: "Actions" });
    expect(group.className).toMatch(/(^|\s)flex(\s|$)/);
    expect(group.className).toMatch(/(^|\s)justify-end(\s|$)/);
  });

  it("carries the border and surface treatment matching the shell's own footer bar", () => {
    render(createElement(ButtonFooter, null, createElement("button", null, "Save")));

    const group = screen.getByRole("group", { name: "Actions" });
    expect(group.className).toMatch(/(^|\s)border-t(\s|$)/);
    expect(group.className).toMatch(/(^|\s)border-border(\s|$)/);
    expect(group.className).toMatch(/(^|\s)bg-surface(\s|$)/);
  });

  it("keeps to the normal document flow instead of fixed positioning, so it reserves its own space rather than covering content", () => {
    render(createElement(ButtonFooter, null, createElement("button", null, "Save")));

    const group = screen.getByRole("group", { name: "Actions" });
    expect(group.className).not.toMatch(/(^|\s)fixed(\s|$)/);
  });

  it("renders without throwing and produces no buttons when given no children", () => {
    expect(() => render(createElement(ButtonFooter, null))).not.toThrow();

    const group = screen.getByRole("group", { name: "Actions" });
    expect(within(group).queryAllByRole("button")).toHaveLength(0);
  });

  describe("rendered by a screen inside the real AppShell", () => {
    it("renders outside AppShell's own scrollable main region, so only main's own content scrolls", async () => {
      const router = buildFooterTestRouter("/cases");
      await router.load();
      render(createElement(RouterProvider, { router }));

      const mainRegion = screen.getByRole("main");
      expect(within(mainRegion).queryByRole("group", { name: "Actions" })).toBeNull();
    });

    it("sits directly above the app's own footer bar rather than inside the scrolling content", async () => {
      const router = buildFooterTestRouter("/cases");
      await router.load();
      render(createElement(RouterProvider, { router }));

      const group = screen.getByRole("group", { name: "Actions" });
      const appFooter = document.querySelector("footer");
      expect(appFooter).not.toBeNull();
      expect(appFooter?.contains(group)).toBe(false);
      expect(
        Boolean(
          group.compareDocumentPosition(appFooter as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ).toBe(true);
    });

    it("still shows AppShell's own no-authentication disclosure, present and outside the footer's own group", async () => {
      const router = buildFooterTestRouter("/cases");
      await router.load();
      render(createElement(RouterProvider, { router }));

      const mainRegion = screen.getByRole("main");
      expect(within(mainRegion).queryByText("No auth in this build")).toBeNull();
      expect(screen.getByText("No auth in this build")).toBeTruthy();
    });
  });
});
