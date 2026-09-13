import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { ConnectorConfigurationDraft } from "../hooks/use-draft-connector-configuration-from-openapi";
import type { Capability } from "../hooks/use-capabilities";
import { responseMapKeyReadByNoneText } from "../services/connector-configuration-messages";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CAPABILITIES_PATH = "/v1/capabilities";
const CONNECTOR = "fsm-http";

function capability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: "tech-profile",
    version: "1.0.0",
    nature: "read-only",
    input_schema: JSON.stringify({ properties: {} }),
    output_schema: JSON.stringify({ properties: { installations: {} } }),
    timeout: 5000,
    connector: CONNECTOR,
    concept: "profile",
    ...overrides,
  };
}

const BASE_DRAFT: ConnectorConfigurationDraft = {
  connector: CONNECTOR,
  configuration: JSON.stringify({ responseMap: { orphan: "$.orphan" } }),
  unresolved: [],
  generated_credentials: [],
  status_readings: [],
  response_fields: [],
  reading_notes: [],
};

function stateWith(
  overrides: Partial<ConnectorConfigurationHelperState> = {},
): ConnectorConfigurationHelperState {
  return {
    connector: CONNECTOR,
    link: "",
    onLinkChange: () => {},
    operations: [],
    operationsOutcome: { kind: "idle" },
    onChooseOperation: () => {},
    path: "/v1/profile",
    onPathChange: () => {},
    method: "GET",
    onMethodChange: () => {},
    onRequestDraft: () => {},
    outcome: { kind: "drafted", draft: BASE_DRAFT },
    ...overrides,
  };
}

function mountWithCapabilities(capabilities: readonly Capability[], state: ConnectorConfigurationHelperState) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === CAPABILITIES_PATH) {
        return new Response(JSON.stringify({ data: capabilities }), { status: 200 });
      }
      throw new Error(
        `connector-configuration-helper-fields submission-withheld-only-on-well-formedness proof: no mocked response for ${url}`,
      );
    }),
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConnectorConfigurationHelperFields, { state, onApply: () => {} }),
    ),
  );
}

describe(
  "ConnectorConfigurationHelperFields -- the responseMap coverage statement carries no claim " +
    "over the configuration-helper's own acts (task's own UNDERDETERMINED entry naming the " +
    "draft-request act, refuted)",
  () => {
    it("leaves the request-draft button and the Apply button both enabled while a responseMap key read by no capability stands stated over the drafted configuration", async () => {
      mountWithCapabilities([capability()], stateWith());

      expect(await screen.findByText(responseMapKeyReadByNoneText("orphan"))).toBeTruthy();

      expect(
        screen.getByRole("button", { name: "Solicitar rascunho" }).hasAttribute("disabled"),
      ).toBe(false);
      expect(screen.getByRole("button", { name: "Aplicar" }).hasAttribute("disabled")).toBe(false);
    });
  },
);
