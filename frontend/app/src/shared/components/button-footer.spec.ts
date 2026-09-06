import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ButtonFooter } from "./button-footer";

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

    const labels = screen.getAllByRole("button").map((button) => button.textContent);
    expect(labels).toEqual(["First", "Second", "Third"]);
  });

  it("renders without throwing and produces no buttons when given no children", () => {
    expect(() => render(createElement(ButtonFooter, null))).not.toThrow();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("stays inside the region it is given while the shell's disclosure stays outside it and present", () => {
    const disclosureText = "No auth in this build";
    render(
      createElement("div", { key: "shell" }, [
        createElement("div", { key: "topbar" }, disclosureText),
        createElement(
          "main",
          { key: "main", "data-testid": "scroll-region" },
          createElement(ButtonFooter, null, createElement("button", null, "Save")),
        ),
      ]),
    );

    const scrollRegion = screen.getByTestId("scroll-region");
    expect(within(scrollRegion).getByRole("button", { name: "Save" })).toBeTruthy();
    expect(within(scrollRegion).queryByText(disclosureText)).toBeNull();
    expect(screen.getByText(disclosureText)).toBeTruthy();
  });
});
