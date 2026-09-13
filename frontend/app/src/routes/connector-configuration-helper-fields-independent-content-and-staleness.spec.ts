import { createElement, Fragment, useState, type JSX } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type {
  ConnectorConfigurationDraft,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: [] }), { status: 200 })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function baseState(outcome: DraftConnectorConfigurationRequestOutcome): ConnectorConfigurationHelperState {
  return {
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "",
    onPathChange: () => {},
    method: "",
    onMethodChange: () => {},
    onRequestDraft: () => {},
    outcome,
  };
}

function renderHelperFields(outcome: DraftConnectorConfigurationRequestOutcome) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
    ),
  );
}

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

const DISTINCTIVE_CONFIGURATION_TEXT = '{"address":"https://api.example.com/v2/translate","distinctive":true}';

const FETCH_REFUSAL: DraftConnectorConfigurationRequestOutcome = {
  kind: "openapi-document-not-fetched",
  link: "https://api.example.com/openapi.json",
  failure: { kind: "network-failure" },
};

const INDEPENDENT_CONFIGURATION_TEXT = "the operator's own untouched configuration text";

function ConfigurationFieldAndHelper({
  outcome,
}: {
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
}): JSX.Element {
  const [configurationFieldText] = useState(INDEPENDENT_CONFIGURATION_TEXT);
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(
      Fragment,
      null,
      createElement("textarea", {
        "aria-label": "Configuration",
        readOnly: true,
        value: configurationFieldText,
      }),
      createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
    ),
  );
}

describe("ConnectorConfigurationHelperFields -- the Configuration field's own content stands exactly as it stood (criterion 1, second half)", () => {
  it("leaves an independently held Configuration field's value unchanged once a draft answers with different configuration text", () => {
    render(
      createElement(ConfigurationFieldAndHelper, {
        outcome: { kind: "drafted", draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT } },
      }),
    );

    expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(INDEPENDENT_CONFIGURATION_TEXT);
  });
});

describe("ConnectorConfigurationHelperFields -- no refusal disclosure changes the Configuration field's own content (criterion 23)", () => {
  it("leaves an independently held Configuration field's value unchanged once a request is refused", () => {
    render(createElement(ConfigurationFieldAndHelper, { outcome: FETCH_REFUSAL }));

    expect(screen.getByLabelText<HTMLTextAreaElement>("Configuration").value).toBe(INDEPENDENT_CONFIGURATION_TEXT);
  });
});

describe("ConnectorConfigurationHelperFields -- a stale drafted disclosure clears the moment a new request begins (UNDERDETERMINED note 3)", () => {
  it("stops showing the previous draft's configuration text once the outcome moves back to pending", () => {
    const { rerender } = renderHelperFields({
      kind: "drafted",
      draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT },
    });
    expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();

    rerender(
      createElement(ConnectorConfigurationHelperFields, {
        state: baseState({ kind: "pending" }),
        onApply: () => {},
      }),
    );

    expect(screen.queryByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeNull();
    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a stale refusal clears the moment a new request begins (UNDERDETERMINED note 3)", () => {
  it("stops showing the previous refusal's alert once the outcome moves back to pending", () => {
    const { rerender } = renderHelperFields(FETCH_REFUSAL);
    expect(screen.getByRole("alert")).toBeTruthy();

    rerender(
      createElement(ConnectorConfigurationHelperFields, {
        state: baseState({ kind: "pending" }),
        onApply: () => {},
      }),
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Rascunhando a configuração do conector…")).toBeTruthy();
  });
});
