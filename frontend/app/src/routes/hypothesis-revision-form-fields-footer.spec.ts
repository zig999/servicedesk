import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hypothesisRevisionFormSchema,
  type HypothesisRevisionFormValues,
} from "../services/hypothesis-revision-form-schema";
import { HypothesisRevisionFormFields } from "./hypothesis-revision-form-fields";
import {
  baseHandlers,
  createFetchStub,
  mountHypothesisForm,
} from "./hypothesis-revision-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function Harness() {
  const form = useForm<HypothesisRevisionFormValues>({
    resolver: zodResolver(hypothesisRevisionFormSchema),
    defaultValues: {
      hypothesis_name: "",
      criterion: "",
      collects: [],
      resolution: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });
  return createElement(HypothesisRevisionFormFields, {
    form,
    hypothesisNameEditable: true,
    subjectType: "billing-dispute",
    collectsOptions: [],
    outcomeOptions: { options: [], isLoading: false, isError: false, refetch: vi.fn() },
    actionOptions: { options: [], isLoading: false, isError: false, refetch: vi.fn() },
    recipientOptions: { options: [], isLoading: false, isError: false, refetch: vi.fn() },
    isSubmitting: false,
    onSubmit: vi.fn(),
  });
}

describe("hypothesis-revision-form-fields renders its action row through the shared footer (criterion 1)", () => {
  it("wraps Save hypothesis inside an accessible group named Actions, rather than a bare flex row", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    await screen.findByLabelText("Hypothesis name");
    const group = screen.getByRole("group", { name: "Actions" });
    expect(within(group).getByRole("button", { name: "Save hypothesis" })).toBeTruthy();
  });
});

describe("the footer carries a Cancel alongside Save (criterion 2, first clause)", () => {
  it("renders Cancel inside the same accessible actions group as Save hypothesis, not as a separate control outside it", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountHypothesisForm(fetchMock);

    await screen.findByLabelText("Hypothesis name");
    const group = screen.getByRole("group", { name: "Actions" });
    expect(within(group).getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(within(group).getByRole("button", { name: "Save hypothesis" })).toBeTruthy();
  });
});

describe("the trailingActions slot is optional and owned by the caller, not a hard-coded Cancel (disclosed inference)", () => {
  it("renders only Save hypothesis when the form-fields component is used with no trailingActions element passed", () => {
    render(createElement(Harness));

    expect(screen.getByRole("button", { name: "Save hypothesis" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
