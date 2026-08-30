import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { prettyPrinted } from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel's
// own criterion 4 ("connector-configuration-form-dialog.tsx's own ConnectorTestPanel call site
// supplies a configurationText value so the file continues to type-check and compile") and its own
// disclosed inference ("connector-configuration-form-dialog.tsx's dead edit-mode branch supplies
// state.configuration.value as its configurationText value").
//
// This edit-mode branch is production-unreachable (connector-configurations-screen.tsx's own
// header comment: the list screen only ever constructs `{ mode: "create" }`), so this file
// constructs the Dialog directly in edit mode rather than reaching it through any screen-level
// navigation -- the only route left to exercise this call site at all.
//
// useTestConnectorPanel is stubbed the same way, and for the same reason, as
// connector-test-panel-forwards-configuration-text.spec.ts -- see that file's own header comment
// for the full reasoning and the TST-03 divergence it discloses (a stand-in for a boundary other
// than network, storage or the clock), carried here too since this file makes the same
// substitution to read this call site's own forwarded value off the DOM.
//
// The received value is echoed into `selectedCapability.input_schema` -- rendered read-only as a
// <pre> by ConnectorTestPanelFields -- rather than into `requester` (a plain text <input>): an
// <input>'s own value assignment strips the newlines pretty-printed JSON carries, which a <pre>'s
// textContent does not, so this is the one field this stub can echo the exact multi-line string
// through.
vi.mock("../hooks/use-test-connector-panel", () => ({
  useTestConnectorPanel: (connector: string, configurationText: string) => ({
    capabilityOptions: [],
    isLoadingCapabilities: false,
    isCapabilitiesError: false,
    selectedCapabilityKey: null,
    selectedCapability: {
      name: "stub-capability",
      version: "1",
      nature: "read-only" as const,
      input_schema: `received:${connector}:${configurationText}`,
      output_schema: "{}",
      timeout: 1000,
      connector,
      concept: "stub-concept",
    },
    onSelectCapability: () => {},
    subjectTypeOptions: [],
    subjectType: "",
    onSubjectTypeChange: () => {},
    attributes: [],
    onAddAttribute: () => {},
    onRemoveAttribute: () => {},
    onAttributeChange: () => {},
    requester: "",
    onRequesterChange: () => {},
    canTest: false,
    testOutcome: { kind: "idle" as const },
    onTest: () => {},
  }),
}));

import { ConnectorConfigurationFormDialog } from "./connector-configuration-form-dialog";

function mountEditMode(configuration: string): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConnectorConfigurationFormDialog, {
        target: {
          mode: "edit",
          connectorConfiguration: { connector: "deepl-connector", configuration },
        },
        onClose: () => {},
      }),
    ),
  );
}

describe("ConnectorConfigurationFormDialog — its own edit-mode ConnectorTestPanel call site supplies configurationText (criterion 4, disclosed inference)", () => {
  it("mounts its own Test section, forwarding this dialog's own currently-typed Configuration text into it -- the same field this dialog already reads at configuration={state.configuration}", async () => {
    const configuration = '{"apiKey":"secret"}';
    mountEditMode(configuration);

    await waitFor(() => {
      const schemaPreview = screen.getByText((_, element) => element?.tagName === "PRE");
      expect(schemaPreview.textContent).toBe(
        `received:deepl-connector:${prettyPrinted(configuration)}`,
      );
    });
  });
});
