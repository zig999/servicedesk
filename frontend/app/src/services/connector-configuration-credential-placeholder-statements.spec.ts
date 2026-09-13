import { describe, expect, it } from "vitest";
import { computeCredentialPlaceholderStatements } from "./connector-configuration-credential-placeholder-statements";

describe(
  "computeCredentialPlaceholderStatements -- names each distinct ${credential:<name>} the " +
    "configuration's well-formed content embeds (criterion 1)",
  () => {
    it("returns the one name a single credential placeholder carries", () => {
      const configurationText = JSON.stringify({ authorization: "${credential:api-key}" });

      expect(computeCredentialPlaceholderStatements(configurationText)).toEqual(["api-key"]);
    });

    it("returns both names, each once, when two distinct credential placeholders are embedded", () => {
      const configurationText = JSON.stringify({
        authorization: "${credential:api-key}",
        secondary: "${credential:signing-secret}",
      });

      expect(computeCredentialPlaceholderStatements(configurationText)).toEqual([
        "api-key",
        "signing-secret",
      ]);
    });

    it("returns a repeated credential name only once despite it being embedded in more than one place", () => {
      const configurationText = JSON.stringify({
        address: "https://api.example.com/${credential:api-key}",
        headers: { Authorization: "Bearer ${credential:api-key}" },
      });

      expect(computeCredentialPlaceholderStatements(configurationText)).toEqual(["api-key"]);
    });
  },
);

describe(
  "computeCredentialPlaceholderStatements -- judges only the ${credential:...} placeholders a " +
    "configuration embeds",
  () => {
    it("ignores ${requester} and ${subject:...} placeholders, returning only the ${credential:...} one present alongside them", () => {
      const configurationText = JSON.stringify({
        actor: "${requester}",
        address: "${subject:account-id}",
        authorization: "${credential:api-key}",
      });

      expect(computeCredentialPlaceholderStatements(configurationText)).toEqual(["api-key"]);
    });

    it("returns no names when the configuration embeds no credential placeholder at all", () => {
      const configurationText = JSON.stringify({ address: "https://api.example.com" });

      expect(computeCredentialPlaceholderStatements(configurationText)).toEqual([]);
    });
  },
);

describe(
  "computeCredentialPlaceholderStatements -- makes its statement only over well-formed JSON " +
    "object text",
  () => {
    it.each([
      ["an empty string", ""],
      ["invalid JSON", "{not valid json, but embeds ${credential:api-key} anyway"],
      ["a JSON array", JSON.stringify(["${credential:api-key}"])],
    ])("returns no names, without throwing, for %s", (_label, text) => {
      expect(computeCredentialPlaceholderStatements(text)).toEqual([]);
    });
  },
);
