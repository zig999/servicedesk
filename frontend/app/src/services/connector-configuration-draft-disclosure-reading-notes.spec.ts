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
    throw new Error("connector-configuration-draft-disclosure-reading-notes proof: expected a drafted disclosure");
  }
  return state;
}

const NINE_READING_NOTE_KINDS = [
  "default-response-not-drafted",
  "status-range-not-drafted",
  "non-json-success-content-not-read",
  "envelope-read-through",
  "variants-united",
  "repeated-field-name-path-not-taken",
  "no-responses-declared",
  "no-success-response-schema",
  "success-schema-declares-no-properties",
] as const;

describe("disclosureStateForOutcome -- each reading note is projected with its own kind and subject unmodified, paired with a non-empty kindLabel, and with its carried detail or with none where the note carries none (criteria 1, 2, 3; domain/integration/connector-configuration-draft-reading-note)", () => {
  it("copies kind and subject through unchanged for every note, carries a carried detail through, and carries no detail for a note naming none", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      reading_notes: [
        { kind: "envelope-read-through", subject: "data", detail: "single-property envelope" },
        { kind: "variants-united", subject: "GET /v1/technicians/{userId}/profile" },
      ],
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    expect(state.draft.readingNotes).toHaveLength(2);
    expect(state.draft.readingNotes[0]).toMatchObject({
      kind: "envelope-read-through",
      subject: "data",
      detail: "single-property envelope",
    });
    expect(state.draft.readingNotes[0]?.kindLabel.length).toBeGreaterThan(0);
    expect(state.draft.readingNotes[1]).toMatchObject({
      kind: "variants-united",
      subject: "GET /v1/technicians/{userId}/profile",
    });
    expect(state.draft.readingNotes[1]?.detail).toBeUndefined();
    expect(state.draft.readingNotes[1]?.kindLabel.length).toBeGreaterThan(0);
  });
});

describe("disclosureStateForOutcome -- each of the nine reading-note kinds the draft's vocabulary holds projects to its own distinct label, none equal to another's (criterion 4; domain/integration/connector-configuration-draft-reading-note-kind)", () => {
  it("produces nine pairwise-distinct labels for the nine closed-set kind values", () => {
    const draft: ConnectorConfigurationDraft = {
      ...BASE_DRAFT,
      reading_notes: NINE_READING_NOTE_KINDS.map((kind, index) => ({ kind, subject: `subject-${index}` })),
    };

    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft }));

    const labels = state.draft.readingNotes.map((note) => note.kindLabel);
    expect(new Set(labels).size).toBe(NINE_READING_NOTE_KINDS.length);
  });
});

describe("disclosureStateForOutcome -- an empty reading_notes list projects no reading note (criterion 5)", () => {
  it("carries through an empty array rather than inventing a reading note", () => {
    const state = drafted(disclosureStateForOutcome({ kind: "drafted", draft: BASE_DRAFT }));

    expect(state.draft.readingNotes).toEqual([]);
  });
});
