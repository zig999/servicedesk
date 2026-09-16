import { describe, expect, it } from "vitest";
import { capabilitySchemaDraftDisclosureFrom } from "./capability-schema-draft-disclosure";
import type { CapabilitySchemaDraft } from "../hooks/use-draft-capability-schema-from-openapi";

const BASE_DRAFT: CapabilitySchemaDraft = {
  input_schema: '{"type":"object","properties":{}}',
  output_schema: '{"type":"object","properties":{}}',
  unresolved: [],
};

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
