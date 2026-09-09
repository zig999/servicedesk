import { describe, expect, it } from "vitest";
import { disclosureStateForOutcome } from "./connector-configuration-draft-disclosure";
import type {
  ConnectorConfigurationDraft,
  ConnectorConfigurationDraftGeneratedCredential,
  DraftConnectorConfigurationRequestOutcome,
} from "../hooks/use-draft-connector-configuration-from-openapi";

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: '{"address":"https://api.example.com/v2/translate"}',
  unresolved: [],
  generated_credentials: [],
};

function drafted(state: ReturnType<typeof disclosureStateForOutcome>) {
  if (state.kind !== "drafted") {
    throw new Error("connector-configuration-draft-disclosure proof: expected a drafted disclosure");
  }
  return state;
}

function refused(state: ReturnType<typeof disclosureStateForOutcome>) {
  if (state.kind !== "refused") {
    throw new Error("connector-configuration-draft-disclosure proof: expected a refused disclosure");
  }
  return state;
}

describe("disclosureStateForOutcome -- idle and pending are their own disclosure kind, carrying no draft or message", () => {
  it("maps an idle outcome to exactly {kind: 'none'}", () => {
    expect(disclosureStateForOutcome({ kind: "idle" })).toEqual({ kind: "none" });
  });

  it("maps a pending outcome to exactly {kind: 'pending'}, carrying no draft even right after a drafted outcome was mapped (UNDERDETERMINED note 3)", () => {
    disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT });

    expect(disclosureStateForOutcome({ kind: "pending" })).toEqual({ kind: "pending" });
  });
});

describe("disclosureStateForOutcome -- an answered draft's configuration text is carried through unmodified (criterion 1)", () => {
  it("carries the draft's own configuration string into the disclosure state, character for character", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.configuration).toBe(BASE_DRAFT.configuration);
  });
});

describe("disclosureStateForOutcome -- each unresolved item's name and reason are disclosed (criterion 2)", () => {
  it("copies the item's name unmodified and pairs it with a non-empty reason label", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      unresolved: [{ name: "api-key", reason: "no-capability-registered" }],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.unresolved).toHaveLength(1);
    expect(state.draft.unresolved[0]?.name).toBe("api-key");
    expect(state.draft.unresolved[0]?.reason).toBe("no-capability-registered");
    expect(state.draft.unresolved[0]?.reasonLabel.length).toBeGreaterThan(0);
  });
});

describe("disclosureStateForOutcome -- an empty unresolved list discloses no unresolved item (criterion 3)", () => {
  it("carries through an empty array rather than inventing an item", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.unresolved).toEqual([]);
  });
});

describe("disclosureStateForOutcome -- each of the four named unresolved reasons gets its own distinct label (UNDERDETERMINED note 2)", () => {
  const FOUR_NAMED_REASONS = [
    "no-capability-registered",
    "no-matching-input-schema-property",
    "security-scheme-not-reducible-to-a-credential",
    "drafted-key-occupied-by-another-security-scheme",
  ];

  it("produces four pairwise-distinct labels for the four closed-set reason values", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      unresolved: FOUR_NAMED_REASONS.map((reason, index) => ({ name: `item-${index}`, reason })),
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    const labels = state.draft.unresolved.map((item) => item.reasonLabel);
    expect(new Set(labels).size).toBe(FOUR_NAMED_REASONS.length);
  });

  it("falls back to the raw reason string for a reason value outside the four named ones (inference)", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      unresolved: [{ name: "api-key", reason: "a-reason-the-closed-four-value-set-does-not-name" }],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.unresolved[0]?.reasonLabel).toBe("a-reason-the-closed-four-value-set-does-not-name");
  });
});

describe("disclosureStateForOutcome -- each generated credential is disclosed by name and security scheme (criterion 4)", () => {
  it("maps name and security_scheme to name and securityScheme, one for one", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      generated_credentials: [{ name: "api-key", security_scheme: "apiKey" }],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.generatedCredentials).toEqual([{ name: "api-key", securityScheme: "apiKey" }]);
  });
});

type GeneratedCredentialWithLeakedValue = ConnectorConfigurationDraftGeneratedCredential & {
  readonly value: string;
};

describe("disclosureStateForOutcome -- no credential value ever appears in the disclosure (criterion 5)", () => {
  it("carries no value field even when the answered credential smuggles one in", () => {
    const credentialWithValue: GeneratedCredentialWithLeakedValue = {
      name: "api-key",
      security_scheme: "apiKey",
      value: "sk-should-never-be-disclosed",
    };
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      generated_credentials: [credentialWithValue],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(Object.keys(state.draft.generatedCredentials[0] ?? {}).sort()).toEqual(["name", "securityScheme"]);
  });
});

describe("disclosureStateForOutcome -- an empty generated-credentials list discloses no credential (criterion 8, generated-credentials part)", () => {
  it("carries through an empty array rather than inventing a credential", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.generatedCredentials).toEqual([]);
  });
});

describe("disclosureStateForOutcome -- a method mismatch is disclosed with both methods (criterion 6)", () => {
  it("carries registered and operation through as two separate values when a mismatch stands", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      method_mismatch: { registered: "GET", operation: "POST" },
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.methodMismatch).toEqual({ registered: "GET", operation: "POST" });
  });
});

describe("disclosureStateForOutcome -- no method mismatch is disclosed when the draft named none (criterion 7)", () => {
  it("carries no method mismatch at all", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.methodMismatch).toBeUndefined();
  });
});

describe("disclosureStateForOutcome -- a fetch refusal names its own failure kind (criterion 9; UNDERDETERMINED note 1)", () => {
  it("names a network failure", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "openapi-document-not-fetched",
      link: "https://api.example.com/openapi.json",
      failure: { kind: "network-failure" },
    };

    const state = refused(disclosureStateForOutcome(outcome));

    expect(state.message).toContain("network failure");
  });

  it("names a timeout, distinctly from a network failure", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "openapi-document-not-fetched",
      link: "https://api.example.com/openapi.json",
      failure: { kind: "timeout" },
    };

    const state = refused(disclosureStateForOutcome(outcome));

    expect(state.message).toContain("timeout");
    expect(state.message).not.toContain("network failure");
  });

  it("names the status when the fetch failed with a status outside the 2xx range", () => {
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "openapi-document-not-fetched",
      link: "https://api.example.com/openapi.json",
      failure: { kind: "status-outside-2xx", status: 503 },
    };

    const state = refused(disclosureStateForOutcome(outcome));

    expect(state.message).toContain("503");
  });

  it("does not echo the operator's own link value back in the message (inference)", () => {
    const operatorLink = "https://api.example.com/openapi.json";
    const outcome: DraftConnectorConfigurationRequestOutcome = {
      kind: "openapi-document-not-fetched",
      link: operatorLink,
      failure: { kind: "network-failure" },
    };

    const state = refused(disclosureStateForOutcome(outcome));

    expect(state.message).not.toContain(operatorLink);
  });
});

describe("disclosureStateForOutcome -- a document-not-readable refusal is its own distinguishable message (criterion 10)", () => {
  it("states that the document could not be read", () => {
    const state = refused(disclosureStateForOutcome({ kind: "openapi-document-not-readable" }));

    expect(state.message).toContain("could not be read");
  });
});

describe("disclosureStateForOutcome -- an operation-not-found refusal names the method and path (criterion 11)", () => {
  it("states the operation's own method and path", () => {
    const state = refused(
      disclosureStateForOutcome({ kind: "openapi-operation-not-found", path: "/v2/translate", method: "PATCH" }),
    );

    expect(state.message).toContain("PATCH");
    expect(state.message).toContain("/v2/translate");
  });
});

describe("disclosureStateForOutcome -- an unrecognised failure is its own fallback, never one of the three named refusals (criterion 12)", () => {
  it("states an unrecognised reason, reusing none of the three named refusal sentences", () => {
    const state = refused(disclosureStateForOutcome({ kind: "unrecognized-failure" }));

    expect(state.message).not.toContain("could not be fetched");
    expect(state.message).not.toContain("could not be read");
    expect(state.message).not.toContain("no operation for method");
  });
});

describe("disclosureStateForOutcome -- every refused outcome maps to {kind: 'refused'}, never {kind: 'drafted'} (criteria 9, 10, 11, 12)", () => {
  type RefusalOutcomeCase = { readonly label: string; readonly outcome: DraftConnectorConfigurationRequestOutcome };

  const REFUSAL_OUTCOME_CASES: readonly RefusalOutcomeCase[] = [
    {
      label: "fetch refusal",
      outcome: {
        kind: "openapi-document-not-fetched",
        link: "https://api.example.com/openapi.json",
        failure: { kind: "network-failure" },
      },
    },
    { label: "document not readable", outcome: { kind: "openapi-document-not-readable" } },
    {
      label: "operation not found",
      outcome: { kind: "openapi-operation-not-found", path: "/v2/translate", method: "PATCH" },
    },
    { label: "unrecognised failure", outcome: { kind: "unrecognized-failure" } },
  ];

  it.each(REFUSAL_OUTCOME_CASES)("maps the $label outcome to disclosure kind 'refused'", ({ outcome }) => {
    expect(disclosureStateForOutcome(outcome).kind).toBe("refused");
  });

  it("gives all four refusal conditions pairwise-distinct messages", () => {
    const messages = REFUSAL_OUTCOME_CASES.map(({ outcome }) => refused(disclosureStateForOutcome(outcome)).message);

    expect(new Set(messages).size).toBe(REFUSAL_OUTCOME_CASES.length);
  });
});
