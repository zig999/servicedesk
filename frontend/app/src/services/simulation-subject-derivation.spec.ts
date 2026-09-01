import { describe, expect, it } from "vitest";
import {
  deriveSubjectFields,
  subjectPlaceholderNamesInConfiguration,
} from "./simulation-subject-derivation";
import type { Capability } from "../hooks/use-capabilities";
import type { CaseInputRequirement } from "../hooks/use-case-input-requirements";

function capability(
  overrides: Pick<Capability, "name" | "version" | "connector" | "concept"> &
    Partial<Capability>,
): Capability {
  return {
    nature: "read-only",
    input_schema: "{}",
    output_schema: "{}",
    timeout: 5000,
    ...overrides,
  };
}

function requirement(
  overrides: Pick<CaseInputRequirement, "attribute" | "required"> &
    Partial<CaseInputRequirement>,
): CaseInputRequirement {
  return {
    capabilities: [],
    ...overrides,
  };
}

describe("simulation-subject-derivation.ts -- criterion 11: deriveRequiredFields and collectionPlanFromManifest are gone from the tree", () => {
  it("no longer exports deriveRequiredFields or collectionPlanFromManifest", async () => {
    const moduleExports = await import("./simulation-subject-derivation");

    expect(Object.keys(moduleExports)).not.toContain("deriveRequiredFields");
    expect(Object.keys(moduleExports)).not.toContain("collectionPlanFromManifest");
  });
});

describe("deriveSubjectFields -- criterion 1: one field per requirement, required and optional alike", () => {
  it("returns exactly one field per requirement, in the read's own order, for a required requirement and an optional one alike", () => {
    const requirements = [
      requirement({ attribute: "account-id", required: true }),
      requirement({ attribute: "case-priority", required: false }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities: [] });

    expect(fields).toHaveLength(2);
    expect(fields.map((field) => field.attribute)).toEqual(["account-id", "case-priority"]);
  });

  it("returns an empty field list for an empty requirements read", () => {
    const fields = deriveSubjectFields({ requirements: [], capabilities: [] });

    expect(fields).toEqual([]);
  });
});

describe("deriveSubjectFields -- criterion 2: each field's required flag carried through unchanged", () => {
  it("sets a field's own required flag to exactly its source requirement's required value, for both a required and an optional requirement", () => {
    const requirements = [
      requirement({ attribute: "account-id", required: true }),
      requirement({ attribute: "case-priority", required: false }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities: [] });

    expect(fields[0]?.required).toBe(true);
    expect(fields[1]?.required).toBe(false);
  });
});

describe("deriveSubjectFields -- criterion 3: naming a resolved capability's connector, matched by its own name-and-version identity", () => {
  it("names the connector of the currently-registered capability sharing the reference's exact name and version", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [{ name: "fetch-billing-account", version: "1" }],
      }),
    ];
    const capabilities = [
      capability({
        name: "fetch-billing-account",
        version: "1",
        connector: "billing-connector",
        concept: "billing-history",
      }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities });

    expect(fields[0]?.capabilities).toEqual([
      { name: "fetch-billing-account", version: "1", connector: "billing-connector", inputSchemaHint: "{}" },
    ]);
  });

  it("does not resolve a capability sharing the reference's own name but not its version", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [{ name: "fetch-billing-account", version: "1" }],
      }),
    ];
    const capabilities = [
      capability({
        name: "fetch-billing-account",
        version: "2",
        connector: "billing-connector",
        concept: "billing-history",
      }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities });

    expect(fields[0]?.capabilities).toEqual([]);
  });
});

describe("deriveSubjectFields -- criterion 4: input_schema carried through as a free-text hint", () => {
  it("passes the resolved capability's own input_schema through untouched, even where it is not itself valid JSON, rather than parsing or validating it", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [{ name: "cap", version: "2" }],
      }),
    ];
    const capabilities = [
      capability({
        name: "cap",
        version: "2",
        connector: "conn",
        concept: "some-concept",
        input_schema: "{ this is not valid json",
      }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities });

    expect(fields[0]?.capabilities[0]?.inputSchemaHint).toBe("{ this is not valid json");
  });
});

describe("deriveSubjectFields -- criteria 5-6: a requirement naming a capability not currently held", () => {
  it("still exposes the field, with an empty capabilities list rather than an invented entry, for a reference resolving to no currently-registered capability", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [{ name: "missing-cap", version: "9" }],
      }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities: [] });

    expect(fields).toEqual([{ attribute: "account-id", required: true, capabilities: [] }]);
  });

  it("resolves only the reference that currently matches and invents no entry for the sibling reference that does not, when a requirement names one resolvable and one unresolvable capability", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [
          { name: "cap-a", version: "1" },
          { name: "missing-cap", version: "9" },
        ],
      }),
    ];
    const capabilities = [
      capability({ name: "cap-a", version: "1", connector: "conn-a", concept: "some-concept" }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities });

    expect(fields[0]?.capabilities).toEqual([
      { name: "cap-a", version: "1", connector: "conn-a", inputSchemaHint: "{}" },
    ]);
  });
});

describe("deriveSubjectFields -- UNDERDETERMINED notes: every currently-registered asking capability is named, each paired with its own identity, never only the first match and never a bare connector", () => {
  it("names both currently-registered capabilities asking for the same attribute, each carrying its own name, version and connector together, rather than only the first match or a bare connector with no identity", () => {
    const requirements = [
      requirement({
        attribute: "account-id",
        required: true,
        capabilities: [
          { name: "cap-a", version: "1" },
          { name: "cap-b", version: "1" },
        ],
      }),
    ];
    const capabilities = [
      capability({ name: "cap-a", version: "1", connector: "conn-a", concept: "some-concept" }),
      capability({ name: "cap-b", version: "1", connector: "conn-b", concept: "some-concept" }),
    ];

    const fields = deriveSubjectFields({ requirements, capabilities });

    expect(fields[0]?.capabilities).toEqual([
      { name: "cap-a", version: "1", connector: "conn-a", inputSchemaHint: "{}" },
      { name: "cap-b", version: "1", connector: "conn-b", inputSchemaHint: "{}" },
    ]);
  });
});

describe("subjectPlaceholderNamesInConfiguration -- criterion 12: every '${subject:<attribute>}' placeholder, wherever it sits", () => {
  it("reads a placeholder embedded in the connector's own declared address", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({ address: "https://api/${subject:account-id}/detail" }),
    );

    expect(names).toEqual(["account-id"]);
  });

  it("reads a placeholder embedded in the connector's own declared query", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({ address: "https://api", query: { acct: "${subject:account-id}" } }),
    );

    expect(names).toEqual(["account-id"]);
  });

  it("reads a placeholder embedded in the connector's own declared headers", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({ address: "https://api", headers: { "X-Account": "${subject:account-id}" } }),
    );

    expect(names).toEqual(["account-id"]);
  });

  it("reads a placeholder embedded anywhere inside the connector's own declared body, including nested inside an array", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({ address: "https://api", body: { filters: [{ account: "${subject:account-id}" }] } }),
    );

    expect(names).toEqual(["account-id"]);
  });

  it("recognizes and skips a requester or credential placeholder rather than reading it as a subject attribute", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({
        address: "https://api/${requester}",
        headers: { Authorization: "Bearer ${credential:api-key}" },
        body: { account: "${subject:account-id}" },
      }),
    );

    expect(names).toEqual(["account-id"]);
  });

  it("contributes no name for a token missing the ':<argument>' the subject kind requires, or carrying an empty one", () => {
    const names = subjectPlaceholderNamesInConfiguration(
      JSON.stringify({ address: "https://api/${subject}/${subject:}" }),
    );

    expect(names).toEqual([]);
  });

  it("contributes zero placeholder names for a connector configuration whose own registered text does not parse as a well-formed JSON object (this module's own inference)", () => {
    expect(subjectPlaceholderNamesInConfiguration("not json at all")).toEqual([]);
  });
});
