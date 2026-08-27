import { describe, expect, it } from "vitest";
import {
  collectionPlanFromManifest,
  deriveRequiredFields,
  subjectPlaceholderNamesInConfiguration,
} from "./simulation-subject-derivation";
import type { Capability } from "../hooks/use-capabilities";
import type { ConnectorConfiguration } from "../hooks/use-connector-configurations";
import type { CaseVersionManifestEntry } from "./case-version-record";

// task/subject-derivation/use-simulation-subject-hook: this file proves the pure derivation
// module directly -- no React, no network -- the same way it is written to be read separately
// from the hook's own render lifecycle (this module's own header comment). The composing hook's
// own state (curator-added attributes, readiness) is proved separately in
// use-simulation-subject.spec.ts.

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

function connectorConfig(connector: string, configuration: unknown): ConnectorConfiguration {
  return {
    connector,
    configuration: typeof configuration === "string" ? configuration : JSON.stringify(configuration),
  };
}

function manifestEntry(
  position: number,
  collects: readonly string[],
): CaseVersionManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: `hypothesis-at-${position}` },
      revision: 1,
      criterion: "some criterion",
      collects,
    },
  };
}

describe("deriveRequiredFields -- criteria 1-2: resolving each concept to its capability, connector and connector's own placeholders", () => {
  it("resolves a concept the collection plan names to the capability currently registered for it and that capability's own connector, annotating the derived field with both", () => {
    const manifest = [manifestEntry(1, ["billing-history"])];
    const capabilities = [
      capability({
        name: "fetch-billing-account",
        version: "1",
        connector: "billing-connector",
        concept: "billing-history",
      }),
    ];
    const connectorConfigurations = [
      connectorConfig("billing-connector", { address: "https://billing/${subject:account-id}" }),
    ];

    const fields = deriveRequiredFields({ manifest, capabilities, connectorConfigurations });

    expect(fields).toEqual([
      {
        attribute: "account-id",
        connector: "billing-connector",
        capability: { name: "fetch-billing-account", version: "1" },
        inputSchemaHint: "{}",
      },
    ]);
  });

  it("returns one required field per distinct attribute name even where the same placeholder is repeated across the address and the body of one connector's own configuration", () => {
    const manifest = [manifestEntry(1, ["billing-history"])];
    const capabilities = [
      capability({ name: "cap", version: "1", connector: "conn", concept: "billing-history" }),
    ];
    const connectorConfigurations = [
      connectorConfig("conn", {
        address: "https://api/${subject:account-id}",
        body: { again: "${subject:account-id}" },
      }),
    ];

    const fields = deriveRequiredFields({ manifest, capabilities, connectorConfigurations });

    expect(fields).toHaveLength(1);
    expect(fields[0]?.attribute).toBe("account-id");
  });

  it("keeps the first connector/capability's own annotation for a placeholder two different connectors both name, in the collection plan's own declared precedence order, rather than the second, later-resolved one (this module's own inference over an untied criterion)", () => {
    const manifest = [manifestEntry(2, ["concept-b"]), manifestEntry(1, ["concept-a"])];
    const capabilities = [
      capability({ name: "cap-a", version: "1", connector: "conn-a", concept: "concept-a" }),
      capability({ name: "cap-b", version: "1", connector: "conn-b", concept: "concept-b" }),
    ];
    const connectorConfigurations = [
      connectorConfig("conn-a", { address: "${subject:shared}" }),
      connectorConfig("conn-b", { address: "${subject:shared}" }),
    ];

    const fields = deriveRequiredFields({ manifest, capabilities, connectorConfigurations });

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      attribute: "shared",
      connector: "conn-a",
      capability: { name: "cap-a", version: "1" },
    });
  });

  it("contributes zero required fields for a concept with no capability currently registered to answer it (this module's own inference)", () => {
    const manifest = [manifestEntry(1, ["unregistered-concept"])];

    const fields = deriveRequiredFields({ manifest, capabilities: [], connectorConfigurations: [] });

    expect(fields).toEqual([]);
  });

  it("contributes zero required fields for a capability whose own connector names no configuration currently registered (this module's own inference)", () => {
    const manifest = [manifestEntry(1, ["some-concept"])];
    const capabilities = [
      capability({ name: "cap", version: "1", connector: "missing-connector", concept: "some-concept" }),
    ];

    const fields = deriveRequiredFields({ manifest, capabilities, connectorConfigurations: [] });

    expect(fields).toEqual([]);
  });
});

describe("subjectPlaceholderNamesInConfiguration -- criterion 2: every '${subject:<attribute>}' placeholder, wherever it sits", () => {
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

describe("deriveRequiredFields -- criterion 3: input_schema carried through as a free-text hint", () => {
  it("passes the resolved capability's own input_schema through untouched, even where it is not itself valid JSON, rather than parsing or validating it", () => {
    const manifest = [manifestEntry(1, ["some-concept"])];
    const capabilities = [
      capability({
        name: "cap",
        version: "2",
        connector: "conn",
        concept: "some-concept",
        input_schema: "{ this is not valid json",
      }),
    ];
    const connectorConfigurations = [connectorConfig("conn", { address: "${subject:x}" })];

    const fields = deriveRequiredFields({ manifest, capabilities, connectorConfigurations });

    expect(fields[0]?.inputSchemaHint).toBe("{ this is not valid json");
  });
});

describe("collectionPlanFromManifest -- domain/knowledge/case-version's own collection-plan operation (this module's own inference)", () => {
  it("returns the deduplicated union of every manifested entry's own collects, ordered by each entry's declared position rather than the array's own order", () => {
    const manifest = [
      manifestEntry(2, ["concept-b", "concept-c"]),
      manifestEntry(1, ["concept-a", "concept-b"]),
    ];

    expect(collectionPlanFromManifest(manifest)).toEqual(["concept-a", "concept-b", "concept-c"]);
  });

  it("derives an empty plan, rather than throwing, for a version whose manifest has not been read back yet", () => {
    expect(collectionPlanFromManifest(undefined)).toEqual([]);
  });
});
