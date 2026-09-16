import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectorConfigurationHelperFields } from "./connector-configuration-helper-fields";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";
import type { ConnectorConfigurationDraft } from "../hooks/use-draft-connector-configuration-from-openapi";
import type { Capability } from "../hooks/use-capabilities";
import { responseMapKeyReadText } from "../services/connector-configuration-messages";

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
  configuration: "{}",
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
    path: "",
    method: "",
    onRequestDraft: () => {},
    outcome: { kind: "drafted", draft: BASE_DRAFT },
    ...overrides,
  };
}

function mountWithCapabilities(
  capabilities: readonly Capability[],
  state: ConnectorConfigurationHelperState,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url === CAPABILITIES_PATH) {
        return new Response(JSON.stringify({ data: capabilities }), { status: 200 });
      }
      throw new Error(
        `connector-configuration-helper-fields response-map-capability-coverage proof: no mocked response for ${url}`,
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
  "ConnectorConfigurationHelperFields -- the responseMap coverage statement is made over the " +
    "configuration of the stated draft, not the (unrelated) field's content (criterion 6)",
  () => {
    it("renders the read statement for a responseMap key the draft's own configuration declares", async () => {
      const draftConfiguration = JSON.stringify({
        responseMap: { installations: "$.installations" },
      });
      mountWithCapabilities(
        [capability()],
        stateWith({
          outcome: { kind: "drafted", draft: { ...BASE_DRAFT, configuration: draftConfiguration } },
        }),
      );

      expect(
        await screen.findByText(responseMapKeyReadText("installations", ["tech-profile (1.0.0)"])),
      ).toBeTruthy();
    });
  },
);
