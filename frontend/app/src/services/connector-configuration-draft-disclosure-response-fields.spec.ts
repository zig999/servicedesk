import { describe, expect, it } from "vitest";
import { disclosureStateForOutcome } from "./connector-configuration-draft-disclosure";
import type { ConnectorConfigurationDraft } from "../hooks/use-draft-connector-configuration-from-openapi";

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: "deepl-connector",
  configuration: '{"address":"https://api.example.com/v2/translate"}',
  unresolved: [],
  generated_credentials: [],
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

function drafted(state: ReturnType<typeof disclosureStateForOutcome>) {
  if (state.kind !== "drafted") {
    throw new Error("connector-configuration-draft-disclosure proof: expected a drafted disclosure");
  }
  return state;
}

describe("disclosureStateForOutcome -- each response field is projected with its own name, path and status, and with exactly the six attributes connector-configuration-draft-response-field declares (criteria 1, 2, 3; domain/integration/connector-configuration-draft-response-field)", () => {
  it("carries name, path and status through unchanged for every field, and carries declaredType, declaredRequired and envelope as undefined for a field carrying none of them, or as the field's own value where it does", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      response_fields: [
        { name: "email", path: "data.email", status: "200" },
        {
          name: "role",
          path: "data.roles[0].name",
          status: "200",
          declared_type: "string",
          declared_required: true,
          envelope: "data",
        },
      ],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.responseFields).toEqual([
      {
        name: "email",
        path: "data.email",
        status: "200",
        declaredType: undefined,
        declaredRequired: undefined,
        envelope: undefined,
      },
      {
        name: "role",
        path: "data.roles[0].name",
        status: "200",
        declaredType: "string",
        declaredRequired: true,
        envelope: "data",
      },
    ]);
  });
});

describe("disclosureStateForOutcome -- a response field's declared_required: false is projected as the literal false, distinct from an absent declared_required (criterion 4)", () => {
  it("carries declaredRequired as false rather than undefined when the field's own declared_required is false", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      response_fields: [{ name: "active", path: "data.active", status: "200", declared_required: false }],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.responseFields[0]?.declaredRequired).toBe(false);
  });
});

describe("disclosureStateForOutcome -- an empty response_fields list projects no response field (criterion 5)", () => {
  it("carries through an empty array rather than inventing a response field", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.responseFields).toEqual([]);
  });
});
