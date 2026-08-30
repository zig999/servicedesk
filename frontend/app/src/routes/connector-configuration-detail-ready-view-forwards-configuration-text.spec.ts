import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
  putCallCount,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/connector-test-panel-reads-registered-configuration/thread-registered-
// configuration-into-test-panel's own criteria 2-4.
//
// This file used to prove task/connector-test-panel-placeholder-attributes/route-configuration-
// text-to-test-panel's own criterion 1 -- that ConnectorConfigurationDetailReadyView forwarded its
// own live, unsaved state.configuration.value into ConnectorTestPanel's configurationText prop --
// through a stand-in replacing ConnectorTestPanel itself (disclosed there as a TST-03 divergence,
// since nothing read that value yet and rendering it as text was the only way to observe it). That
// corrective task found forwarding the live, unsaved edit was itself the wrong behavior
// (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability: the
// configuration a test exercises is the one currently registered under the connector's own name,
// never text an operator holds unsaved in an authoring surface), and this file's own assertions
// now state the corrected behavior instead.
//
// The stand-in is gone: task/connector-test-panel-placeholder-attributes/reconcile-test-panel-
// attribute-rows (already delivered, unchanged by this task -- criterion 5) made
// useTestConnectorPanel's own "Add attribute" reconcile its rows against whichever configurationText
// string it is given, so the real, unmocked ConnectorTestPanel now renders an observable difference
// for whichever text actually reaches it -- reading that reconciliation off the DOM proves what this
// route forwards without replacing ConnectorTestPanel's own rendering logic (TST-03's own "never the
// component's own rendering logic").
//
// Configuration text embeds a distinct '${subject:<name>}' placeholder per fixture below
// (services/simulation-subject-derivation.ts's own placeholder grammar) so a wrongly-sourced
// reconciliation is visible as a different row appearing, not merely a value staying the same.

const CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER =
  '{"address":"https://api.example.com/${subject:account-id}"}';
const CONFIGURATION_WITH_REGION_PLACEHOLDER =
  '{"address":"https://api.example.com/${subject:region}"}';

afterEach(() => {
  vi.unstubAllGlobals();
});

function attributeNames(): readonly string[] {
  return screen
    .queryAllByLabelText<HTMLInputElement>("Attribute")
    .map((input) => input.value);
}

function clickAddAttribute(): void {
  fireEvent.click(screen.getByRole("button", { name: "Add attribute" }));
}

describe("ConnectorConfigurationDetailReadyView — Add attribute reconciles against the registered configuration text, not an unsaved edit (criterion 3)", () => {
  it("keeps reconciling against the last registered text after Configuration is edited but not saved", async () => {
    const fetchMock = createFetchStub(baseHandlers(CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    clickAddAttribute();
    expect(attributeNames()).toEqual(["account-id"]);

    fireEvent.change(configurationField, {
      target: { value: CONFIGURATION_WITH_REGION_PLACEHOLDER },
    });

    clickAddAttribute();

    // If this route forwarded the live, unsaved edit instead of the registered text, the
    // account-id row would have been dropped and a region row added instead.
    expect(attributeNames()).toEqual(["account-id"]);
  });
});

describe("ConnectorConfigurationDetailReadyView — Add attribute reconciles against the just-saved configuration text once a save lands (criterion 4)", () => {
  it("reconciles against the newly saved text the next time Add attribute is clicked after a successful save", async () => {
    const fetchMock = createFetchStub(baseHandlers(CONFIGURATION_WITH_ACCOUNT_ID_PLACEHOLDER));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    const configurationField = await screen.findByLabelText<HTMLTextAreaElement>("Configuration");

    clickAddAttribute();
    expect(attributeNames()).toEqual(["account-id"]);

    fireEvent.change(configurationField, {
      target: { value: CONFIGURATION_WITH_REGION_PLACEHOLDER },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await screen.findByText("Saved.");

    clickAddAttribute();

    // The account-id row is now dropped and a region row added -- reconciliation now reads the
    // just-saved (now registered) text, not the value that was registered before this save.
    expect(attributeNames()).toEqual(["region"]);
  });
});
