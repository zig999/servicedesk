import { describe, expect, it } from "vitest";
import type { Capability } from "../hooks/use-capabilities";
import { computeSubjectPlaceholderStatements } from "./connector-configuration-subject-placeholder-statements";

function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "acme-lookup",
    version: "1.0.0",
    nature: "read-only",
    input_schema: JSON.stringify({ properties: {} }),
    output_schema: JSON.stringify({}),
    timeout: 5000,
    connector: "acme-connector",
    concept: "lookup",
    ...overrides,
  };
}

describe(
  "computeSubjectPlaceholderStatements -- states that a subject placeholder is declared when " +
    "every capability in the list declares its attribute name (criterion 1)",
  () => {
    it("returns a declared statement when every capability in the list declares the placeholder's attribute name", () => {
      const configurationText = JSON.stringify({
        address: "https://api.example.com/${subject:account-id}",
      });
      const capabilities = [
        capability({
          name: "lookup-a",
          version: "1.0.0",
          input_schema: JSON.stringify({ properties: { "account-id": { type: "string" } } }),
        }),
        capability({
          name: "lookup-b",
          version: "2.0.0",
          input_schema: JSON.stringify({
            properties: { "account-id": { type: "string" }, extra: {} },
          }),
        }),
      ];

      expect(computeSubjectPlaceholderStatements(configurationText, capabilities)).toEqual([
        { kind: "declared", attributeName: "account-id" },
      ]);
    });
  },
);

describe(
  "computeSubjectPlaceholderStatements -- names the capability that does not declare the " +
    "attribute when one such capability does not (criterion 2)",
  () => {
    it("returns an undeclared statement naming the one capability whose input schema properties omit the attribute", () => {
      const configurationText = JSON.stringify({ address: "${subject:account-id}" });
      const declaring = capability({
        name: "lookup-a",
        version: "1.0.0",
        input_schema: JSON.stringify({ properties: { "account-id": {} } }),
      });
      const nonDeclaring = capability({
        name: "billing-capability",
        version: "2.0.0",
        input_schema: JSON.stringify({ properties: { other: {} } }),
      });

      expect(
        computeSubjectPlaceholderStatements(configurationText, [declaring, nonDeclaring]),
      ).toEqual([
        {
          kind: "undeclared",
          attributeName: "account-id",
          nonDeclaringCapabilityLabels: ["billing-capability (2.0.0)"],
        },
      ]);
    });
  },
);

describe(
  "computeSubjectPlaceholderStatements -- states that subject placeholders cannot be checked " +
    "when no capability is registered for the connector (criterion 3)",
  () => {
    it("returns a single cannot-be-checked entry regardless of how many distinct subject placeholders the configuration embeds", () => {
      const configurationText = JSON.stringify({
        address: "${subject:account-id}",
        region: "${subject:region}",
      });

      expect(computeSubjectPlaceholderStatements(configurationText, [])).toEqual([
        { kind: "cannot-be-checked" },
      ]);
    });
  },
);

describe(
  "computeSubjectPlaceholderStatements -- judges only the ${subject:...} placeholders a " +
    "configuration embeds",
  () => {
    it("returns no statements when the configuration embeds no subject placeholder at all, even with capabilities registered", () => {
      const configurationText = JSON.stringify({ address: "https://api.example.com" });

      expect(computeSubjectPlaceholderStatements(configurationText, [capability()])).toEqual([]);
    });

    it("ignores ${requester} and ${credential:<name>} placeholders, judging only the ${subject:...} one present alongside them", () => {
      const configurationText = JSON.stringify({
        address: "${subject:account-id}",
        authorization: "${credential:api-key}",
        actor: "${requester}",
      });
      const capabilities = [
        capability({ input_schema: JSON.stringify({ properties: { "account-id": {} } }) }),
      ];

      expect(computeSubjectPlaceholderStatements(configurationText, capabilities)).toEqual([
        { kind: "declared", attributeName: "account-id" },
      ]);
    });

    it("judges two distinct subject placeholders independently, one declared and one undeclared", () => {
      const configurationText = JSON.stringify({
        address: "${subject:account-id}",
        region: "${subject:region}",
      });
      const capabilities = [
        capability({
          name: "lookup-a",
          version: "1.0.0",
          input_schema: JSON.stringify({ properties: { "account-id": {}, region: {} } }),
        }),
        capability({
          name: "lookup-b",
          version: "1.1.0",
          input_schema: JSON.stringify({ properties: { "account-id": {} } }),
        }),
      ];

      expect(computeSubjectPlaceholderStatements(configurationText, capabilities)).toEqual([
        { kind: "declared", attributeName: "account-id" },
        {
          kind: "undeclared",
          attributeName: "region",
          nonDeclaringCapabilityLabels: ["lookup-b (1.1.0)"],
        },
      ]);
    });
  },
);

describe(
  "computeSubjectPlaceholderStatements -- makes its statement only over well-formed JSON object text",
  () => {
    it("returns no statements, without throwing, for configuration text that is not well-formed JSON object text", () => {
      const configurationText = '{not valid json, but embeds ${subject:account-id} anyway';
      const capabilities = [
        capability({ input_schema: JSON.stringify({ properties: { "account-id": {} } }) }),
      ];

      expect(computeSubjectPlaceholderStatements(configurationText, capabilities)).toEqual([]);
    });
  },
);
