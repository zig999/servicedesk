import { describe, expect, it } from "vitest";
import type { Capability } from "../hooks/use-capabilities";
import { computeResponseMapCapabilityCoverage } from "./connector-configuration-response-map-capability-coverage";

function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "acme-lookup",
    version: "1.0.0",
    nature: "read-only",
    input_schema: JSON.stringify({ properties: {} }),
    output_schema: JSON.stringify({ properties: {} }),
    timeout: 5000,
    connector: "acme-connector",
    concept: "lookup",
    ...overrides,
  };
}

describe(
  "computeResponseMapCapabilityCoverage -- a responseMap key naming an output-schema property " +
    "is stated as read by the naming capability, and a key naming none is stated as read by no " +
    "capability (criteria 1 and 2)",
  () => {
    it("classifies a matching responseMap key as read by the capability that declares it, and a non-matching key as read by none", () => {
      const configurationText = JSON.stringify({
        responseMap: { covered: "$.covered", orphan: "$.orphan" },
      });
      const capabilities = [
        capability({
          name: "acme-lookup",
          version: "1.0.0",
          output_schema: JSON.stringify({ properties: { covered: {} } }),
        }),
      ];

      expect(computeResponseMapCapabilityCoverage(configurationText, capabilities)).toEqual({
        kind: "coverage",
        keyStatements: [
          { kind: "read", key: "covered", capabilityLabels: ["acme-lookup (1.0.0)"] },
          { kind: "read-by-none", key: "orphan" },
        ],
        expectedFieldStatements: [],
      });
    });
  },
);

describe(
  "computeResponseMapCapabilityCoverage -- a capability's own output-schema property that no " +
    "responseMap key names is stated as expected, while one a key does name is not (criterion 3)",
  () => {
    it("lists only the output-schema property no responseMap key names, excluding the one a key does name", () => {
      const configurationText = JSON.stringify({ responseMap: { named: "$.named" } });
      const capabilities = [
        capability({
          name: "acme-lookup",
          version: "2.0.0",
          output_schema: JSON.stringify({ properties: { named: {}, unnamed: {} } }),
        }),
      ];

      expect(computeResponseMapCapabilityCoverage(configurationText, capabilities)).toEqual({
        kind: "coverage",
        keyStatements: [
          { kind: "read", key: "named", capabilityLabels: ["acme-lookup (2.0.0)"] },
        ],
        expectedFieldStatements: [{ capabilityLabel: "acme-lookup (2.0.0)", fieldName: "unnamed" }],
      });
    });
  },
);

describe(
  "computeResponseMapCapabilityCoverage -- states that which fields an observation would carry " +
    "cannot be read where no capability is registered for the connector (criterion 4)",
  () => {
    it("returns cannot-be-read for an empty capability list regardless of the responseMap's own keys", () => {
      const configurationText = JSON.stringify({ responseMap: { a: "$.a", b: "$.b" } });

      expect(computeResponseMapCapabilityCoverage(configurationText, [])).toEqual({
        kind: "cannot-be-read",
      });
    });
  },
);

describe(
  "computeResponseMapCapabilityCoverage -- makes its statement only over well-formed JSON " +
    "object text declaring a responseMap object",
  () => {
    it("returns null when the configuration is well-formed JSON object text declaring no responseMap key", () => {
      const configurationText = JSON.stringify({ other: "value" });

      expect(computeResponseMapCapabilityCoverage(configurationText, [capability()])).toBeNull();
    });

    it("returns null, without throwing, for configuration text that is not well-formed JSON object text", () => {
      const configurationText = "{not valid json, but a responseMap key anyway";

      expect(() =>
        computeResponseMapCapabilityCoverage(configurationText, [capability()]),
      ).not.toThrow();
      expect(computeResponseMapCapabilityCoverage(configurationText, [capability()])).toBeNull();
    });
  },
);

describe(
  "computeResponseMapCapabilityCoverage -- the fsm-http / tech-profile scenario: installations " +
    "is read, id and syncEvents are read by none, and login is expected but unnamed " +
    "(scenarios/integration/a-response-map-key-the-capability-does-not-read-is-stated-beside-the-field-it-expects)",
  () => {
    it("states every one of the scenario's three findings from a single call", () => {
      const configurationText = JSON.stringify({
        responseMap: { id: "$.id", installations: "$.installations", syncEvents: "$.syncEvents" },
      });
      const capabilities = [
        capability({
          name: "tech-profile",
          version: "1.0.0",
          output_schema: JSON.stringify({ properties: { login: {}, installations: {} } }),
        }),
      ];

      expect(computeResponseMapCapabilityCoverage(configurationText, capabilities)).toEqual({
        kind: "coverage",
        keyStatements: [
          { kind: "read-by-none", key: "id" },
          { kind: "read", key: "installations", capabilityLabels: ["tech-profile (1.0.0)"] },
          { kind: "read-by-none", key: "syncEvents" },
        ],
        expectedFieldStatements: [{ capabilityLabel: "tech-profile (1.0.0)", fieldName: "login" }],
      });
    });
  },
);
