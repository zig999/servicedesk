import { createElement, Fragment, useState, type JSX } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type {
  ConnectorConfigurationDraft,
  ConnectorConfigurationDraftGeneratedCredential,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

function normalized(element: HTMLElement): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

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
  return render(
    createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
  );
}

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: "{}",
  unresolved: [],
  generated_credentials: [],
};

const DISTINCTIVE_CONFIGURATION_TEXT = '{"address":"https://api.example.com/v2/translate","distinctive":true}';

const FETCH_REFUSAL: DraftConnectorConfigurationRequestOutcome = {
  kind: "openapi-document-not-fetched",
  link: "https://api.example.com/openapi.json",
  failure: { kind: "network-failure" },
};
const NOT_READABLE_REFUSAL: DraftConnectorConfigurationRequestOutcome = { kind: "openapi-document-not-readable" };
const OPERATION_NOT_FOUND_REFUSAL: DraftConnectorConfigurationRequestOutcome = {
  kind: "openapi-operation-not-found",
  path: "/v2/translate",
  method: "PATCH",
};
const UNRECOGNIZED_REFUSAL: DraftConnectorConfigurationRequestOutcome = { kind: "unrecognized-failure" };

describe("ConnectorConfigurationHelperFields -- idle renders neither a refusal nor a draft", () => {
  it("shows no drafting line, no alert and no drafted disclosure while idle", () => {
    renderHelperFields({ kind: "idle" });

    expect(screen.queryByText("Drafting the connector configuration…")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a pending request shows a drafting line (disclosed inference)", () => {
  it("shows the drafting line and neither an alert nor a drafted disclosure while pending", () => {
    renderHelperFields({ kind: "pending" });

    expect(screen.getByText("Drafting the connector configuration…")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an answered draft's configuration text is disclosed verbatim (criterion 1)", () => {
  it("renders the draft's own configuration text unmodified", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, configuration: DISTINCTIVE_CONFIGURATION_TEXT },
    };

    renderHelperFields(outcome);

    expect(screen.getByText(DISTINCTIVE_CONFIGURATION_TEXT)).toBeTruthy();
  });
});

describe("ConnectorConfigurationHelperFields -- each unresolved item is disclosed by its own name, paired with a translated reason (criterion 2)", () => {
  it("shows the item's name and a reason label that is not the raw reason string", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, unresolved: [{ name: "api-key", reason: "no-capability-registered" }] },
    };

    renderHelperFields(outcome);

    const item = screen.getByRole("listitem");
    expect(normalized(item)).toMatch(/^api-key:\s+\S.+/);
    expect(normalized(item)).not.toContain("no-capability-registered");
  });
});

describe("ConnectorConfigurationHelperFields -- an empty unresolved list discloses no unresolved item (criterion 3)", () => {
  it("renders no Unresolved section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Unresolved")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- each generated credential is disclosed by name and security scheme (criterion 4)", () => {
  it("shows the credential's own name and security scheme", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, generated_credentials: [{ name: "api-key", security_scheme: "apiKey" }] },
    };

    renderHelperFields(outcome);

    expect(normalized(screen.getByRole("listitem"))).toBe("api-key: apiKey");
  });
});

type GeneratedCredentialWithLeakedValue = ConnectorConfigurationDraftGeneratedCredential & {
  readonly value: string;
};

describe("ConnectorConfigurationHelperFields -- no credential value ever renders (criterion 5)", () => {
  it("shows no leaked value even when the answered credential smuggles one in", () => {
    const credentialWithValue: GeneratedCredentialWithLeakedValue = {
      name: "api-key",
      security_scheme: "apiKey",
      value: "sk-should-never-be-disclosed",
    };
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, generated_credentials: [credentialWithValue] },
    };

    const { container } = renderHelperFields(outcome);

    expect(container.textContent).not.toContain("sk-should-never-be-disclosed");
  });
});

describe("ConnectorConfigurationHelperFields -- an empty generated-credentials list discloses no credential (criterion 8, generated-credentials part)", () => {
  it("renders no Generated credentials section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Generated credentials")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a method mismatch discloses both methods under separate labels (criterion 6)", () => {
  it("shows the registered and drafted methods, neither in place of the other", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "drafted",
      draft: { ...BASE_DRAFT, method_mismatch: { registered: "GET", operation: "POST" } },
    };

    renderHelperFields(outcome);

    const line = normalized(screen.getByText(/Registered/));
    expect(line).toContain("Registered: GET");
    expect(line).toContain("Drafted: POST");
  });
});

describe("ConnectorConfigurationHelperFields -- no method mismatch is disclosed when the draft names none (criterion 7)", () => {
  it("renders no Method mismatch section", () => {
    renderHelperFields({ kind: "drafted", draft: BASE_DRAFT });

    expect(screen.queryByText("Method mismatch")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a fetch refusal is disclosed as an alert with no draft part beside it (criterion 9)", () => {
  it("shows the fetch-refusal message as an alert and no drafted disclosure", () => {
    renderHelperFields(FETCH_REFUSAL);

    expect(screen.getByRole("alert").textContent).toContain("could not be fetched");
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- a document-not-readable refusal is disclosed as an alert with no draft part beside it (criterion 10)", () => {
  it("shows the document-not-readable message as an alert and no drafted disclosure", () => {
    renderHelperFields(NOT_READABLE_REFUSAL);

    expect(screen.getByRole("alert").textContent).toContain("could not be read");
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an operation-not-found refusal is disclosed as an alert with no draft part beside it (criterion 11)", () => {
  it("shows the method and path as an alert and no drafted disclosure", () => {
    renderHelperFields(OPERATION_NOT_FOUND_REFUSAL);

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).toContain("PATCH");
    expect(alertText).toContain("/v2/translate");
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

describe("ConnectorConfigurationHelperFields -- an unrecognised failure is disclosed as its own alert, distinct from the three named refusals (criterion 12)", () => {
  it("shows a fallback message reusing none of the three named refusal sentences, and no drafted disclosure", () => {
    renderHelperFields(UNRECOGNIZED_REFUSAL);

    const alertText = screen.getByRole("alert").textContent ?? "";
    expect(alertText).not.toContain("could not be fetched");
    expect(alertText).not.toContain("could not be read");
    expect(alertText).not.toContain("no operation for method");
    expect(screen.queryByText("Drafted configuration")).toBeNull();
  });
});

const INDEPENDENT_CONFIGURATION_TEXT = "the operator's own untouched configuration text";

function ConfigurationFieldAndHelper({
  outcome,
}: {
  readonly outcome: DraftConnectorConfigurationRequestOutcome;
}): JSX.Element {
  const [configurationFieldText] = useState(INDEPENDENT_CONFIGURATION_TEXT);
  return createElement(
    Fragment,
    null,
    createElement("textarea", {
      "aria-label": "Configuration",
      readOnly: true,
      value: configurationFieldText,
    }),
    createElement(ConnectorConfigurationHelperFields, { state: baseState(outcome), onApply: () => {} }),
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
    expect(screen.getByText("Drafting the connector configuration…")).toBeTruthy();
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
    expect(screen.getByText("Drafting the connector configuration…")).toBeTruthy();
  });
});
