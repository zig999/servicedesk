import { describe, expect, it } from "vitest";
import {
  capabilitySchemaDraftDisclosureFrom,
  capabilitySchemaDraftRefusalDisclosureFrom,
} from "./capability-schema-draft-disclosure";
import {
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE,
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE,
  CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE,
} from "./capability-schema-messages";
import type {
  CapabilitySchemaDraft,
  DraftCapabilitySchemaRequestOutcome,
} from "../hooks/use-draft-capability-schema-from-openapi";

const BASE_DRAFT: CapabilitySchemaDraft = {
  input_schema: '{"type":"object","properties":{}}',
  output_schema: '{"type":"object","properties":{}}',
  unresolved: [],
};

const NOT_FETCHED_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-document-not-fetched",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};
const NOT_READABLE_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-document-not-readable",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "POST",
};
const OPERATION_NOT_FOUND_REFUSAL: DraftCapabilitySchemaRequestOutcome = {
  kind: "openapi-operation-not-found",
  link: "https://api.example.com/openapi.json",
  path: "/v2/translate",
  method: "PATCH",
};
const UNRECOGNIZED_REFUSAL: DraftCapabilitySchemaRequestOutcome = { kind: "unrecognized-failure" };

describe("capabilitySchemaDraftDisclosureFrom -- the draft's input_schema and output_schema are carried through unaltered, and the disclosure holds exactly the draft's three declared attributes (domain/integration/capability-schema-draft)", () => {
  it("returns inputSchema and outputSchema equal, character for character, to the draft's own fields, and no key beyond inputSchema, outputSchema and unresolved", () => {
    const draft: CapabilitySchemaDraft = {
      ...BASE_DRAFT,
      input_schema: '{"type":"object","properties":{"a":{"type":"string"}}}',
      output_schema: '{"type":"object","properties":{"b":{"type":"number"}}}',
    };

    const disclosure = capabilitySchemaDraftDisclosureFrom(draft);

    expect(disclosure.inputSchema).toBe(draft.input_schema);
    expect(disclosure.outputSchema).toBe(draft.output_schema);
    expect(Object.keys(disclosure).sort()).toEqual(["inputSchema", "outputSchema", "unresolved"]);
  });
});

describe("capabilitySchemaDraftDisclosureFrom -- an empty unresolved list is carried through as an empty list, inventing no item (domain/integration/capability-schema-draft)", () => {
  it("returns an empty unresolved array for a draft carrying none", () => {
    const disclosure = capabilitySchemaDraftDisclosureFrom(BASE_DRAFT);

    expect(disclosure.unresolved).toEqual([]);
  });
});

describe("capabilitySchemaDraftDisclosureFrom -- every unresolved entry is mapped one-to-one, each disclosure item carrying that same entry's own name and reason unaltered (domain/integration/capability-schema-draft-unresolved-item)", () => {
  it("maps every unresolved entry in order, preserving each one's own name and reason and adding nothing beyond a reasonLabel", () => {
    const draft: CapabilitySchemaDraft = {
      ...BASE_DRAFT,
      unresolved: [
        { name: "first-field", reason: "schema-not-reducible-to-a-type" },
        { name: "second-field", reason: "name-claimed-by-another-parameter" },
      ],
    };

    const disclosure = capabilitySchemaDraftDisclosureFrom(draft);

    expect(disclosure.unresolved).toHaveLength(2);
    expect(disclosure.unresolved[0]?.name).toBe("first-field");
    expect(disclosure.unresolved[0]?.reason).toBe("schema-not-reducible-to-a-type");
    expect(disclosure.unresolved[1]?.name).toBe("second-field");
    expect(disclosure.unresolved[1]?.reason).toBe("name-claimed-by-another-parameter");
    expect(Object.keys(disclosure.unresolved[0] ?? {}).sort()).toEqual(["name", "reason", "reasonLabel"]);
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- an unfetchable-link refusal states its own fixed message (criterion 1)", () => {
  it("returns the not-fetched message for an openapi-document-not-fetched outcome", () => {
    const disclosure = capabilitySchemaDraftRefusalDisclosureFrom(NOT_FETCHED_REFUSAL);

    expect(disclosure?.message).toBe(CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE);
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- an unreadable-document refusal states its own fixed message (criterion 2)", () => {
  it("returns the not-readable message for an openapi-document-not-readable outcome", () => {
    const disclosure = capabilitySchemaDraftRefusalDisclosureFrom(NOT_READABLE_REFUSAL);

    expect(disclosure?.message).toBe(CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE);
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- an operation-not-found refusal names the operation's own method and path (criterion 3)", () => {
  it("returns a message naming the outcome's own method and path", () => {
    const disclosure = capabilitySchemaDraftRefusalDisclosureFrom(OPERATION_NOT_FOUND_REFUSAL);

    expect(disclosure?.message).toContain("PATCH");
    expect(disclosure?.message).toContain("/v2/translate");
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- an unrecognised failure states its own fixed fallback message, reusing none of the three named refusals (criterion 4)", () => {
  it("returns the unrecognized-failure message, matching none of the three named conditions", () => {
    const disclosure = capabilitySchemaDraftRefusalDisclosureFrom(UNRECOGNIZED_REFUSAL);

    expect(disclosure?.message).toBe(CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_UNRECOGNIZED_FAILURE_MESSAGE);
    expect(disclosure?.message).not.toBe(CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_FETCHED_MESSAGE);
    expect(disclosure?.message).not.toBe(CAPABILITY_SCHEMA_DRAFT_NOT_GENERATED_NOT_READABLE_MESSAGE);
    expect(disclosure?.message).not.toContain("não declara nenhuma operação");
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- the four refusal kinds are pairwise distinguishable from one another (criteria 1, 2, 3, 4)", () => {
  it("produces four pairwise-distinct messages, one per refusal outcome kind", () => {
    const messages = [NOT_FETCHED_REFUSAL, NOT_READABLE_REFUSAL, OPERATION_NOT_FOUND_REFUSAL, UNRECOGNIZED_REFUSAL].map(
      (outcome) => capabilitySchemaDraftRefusalDisclosureFrom(outcome)?.message,
    );

    expect(new Set(messages).size).toBe(4);
  });
});

describe("capabilitySchemaDraftRefusalDisclosureFrom -- no refusal is produced for a request the operation has not answered (criteria 6, 7)", () => {
  it("returns undefined for an idle outcome and for a pending outcome", () => {
    expect(capabilitySchemaDraftRefusalDisclosureFrom({ kind: "idle" })).toBeUndefined();
    expect(capabilitySchemaDraftRefusalDisclosureFrom({ kind: "pending" })).toBeUndefined();
  });
});
