import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import {
  LOADED_CONFIGURATION,
  baseHandlers,
  createFetchStub,
  mountConnectorConfigurationDetailScreen,
} from "./connector-configuration-detail-screen.test-support";

// Proof for task/capability-detail-layout/schema-editor-height-increase's own criterion 3: the
// connector-configuration form's own configuration field -- the shared JsonTextareaField's third
// consumer -- keeps its current 160px/10rem minimum height unchanged, because this task's own
// opt-in `tall` prop is never passed at this call site. connector-configuration-detail-screen.spec.ts's
// own existing assertions locate this field by label text and never inspect className or height,
// so a build that passed `tall` here too -- raising every consumer along with the capability
// screen's two fields, rather than scoping the increase to them alone -- would satisfy every one
// of that file's assertions unchanged. This file adds the one check criterion 3 needs and that
// suite does not make.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ConnectorConfigurationDetailScreen -- the configuration field keeps its 160px/10rem height (criterion 3)", () => {
  it("renders the Configuration field's Textarea with the shared component's own 10rem default minimum-height class, not the capability screen's taller variant", async () => {
    const fetchMock = createFetchStub(baseHandlers(LOADED_CONFIGURATION));
    await mountConnectorConfigurationDetailScreen(fetchMock);
    await screen.findByLabelText("Configuration");

    const configurationField = screen.getByLabelText<HTMLTextAreaElement>("Configuration");

    expect(configurationField.className).toContain("min-h-40");
    // Asserted as an explicit exclusion, not merely "the default class is present": a build
    // applying both minimum-height classes at once would leave Tailwind's own cascade order,
    // rather than this call site never passing `tall`, to decide which height actually wins.
    expect(configurationField.className).not.toContain("min-h-[12.5rem]");
  });
});
