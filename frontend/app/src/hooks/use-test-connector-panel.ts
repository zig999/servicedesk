/**
 * The Connector Configuration editor's Test section
 * (task/connector-configuration-authoring/test-connector-debug-panel,
 * contracts/integration/connector-diagnostics,
 * rules/integration/a-connector-configuration-is-tested-through-a-registered-capability):
 * state and dispatch for exercising one connector configuration's own call,
 * once, through a specific, already-registered capability that names it.
 *
 * Composes useCapabilities() and useGlossaryVocabularyOptions("subject-type")
 * rather than re-deriving either read (use-capabilities.ts,
 * use-glossary-vocabulary.ts), and dispatches the diagnostic call itself
 * through apiFetch the same way every other mutation in this app does
 * (use-connector-configuration-form.ts's own POST/PUT convention) --
 * POST /v1/test-connector (contracts/integration/connector-diagnostics).
 *
 * The subject assembled here is never a stored subject read back
 * (that contract's own "against a subject assembled the same way any other
 * observation assembles one -- never a stored subject read back"): subject
 * type and its attribute-value pairs are held as plain component state (no
 * useFieldArray, no react-hook-form -- this call is a one-shot diagnostic
 * dispatch, not a persisted resource with its own validation lifecycle),
 * recorded as this task's own inference in its delivery record. Each row
 * carries a locally generated `id` only so the fields component can key its
 * list by something stable rather than array index (MNT-04) -- that id
 * never leaves this hook; the wire body sends only `attribute`/`value`.
 *
 * `requester` is a plain free-text field: no existing screen in this app
 * collects a requester identity today (no precedent to extend), and
 * test-connector.dto.ts's own header comment states it "travels ... as an
 * unverified claim taken straight from the body" -- an operator types
 * whatever string resolveConnectorRequest needs to resolve a `${requester}`
 * placeholder, exactly the way a real observation would supply one.
 *
 * A dispatch failure (the POST to /v1/test-connector itself failing --
 * distinct from criterion 6, which is the *downstream* connector call
 * failing or timing out, carried inside a successful response's own
 * discriminated `response` field) is resolved through error-ui-state.ts's
 * central mapping the same way useConnectorConfigurationForm's own
 * saveFailureMessage is, so a future distinct wording is added there rather
 * than hand-checked at this call site (API-02) -- today no criterion states
 * one, so every kind falls back to one generic message.
 */

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { SelectOption } from "@tui/ui/select";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import { useCapabilities, type Capability } from "./use-capabilities";
import { useGlossaryVocabularyOptions } from "./use-glossary-vocabulary";

/** One attribute-value pair the operator types by hand, mirroring test-connector.dto.ts's own subjectAttributeValueSchema (wire shape -- no `id`). */
export type SubjectAttributeValue = {
  readonly attribute: string;
  readonly value: string;
};

/** A subject attribute-value row as this panel edits it -- `id` is local-only, generated so the row list can be keyed stably (MNT-04) without echoing anything through the wire body. */
export type SubjectAttributeRow = SubjectAttributeValue & {
  readonly id: string;
};

/** The request body POST /v1/test-connector validates, mirrored from testConnectorRequestSchema (test-connector.dto.ts). */
export type TestConnectorRequestBody = {
  readonly capability: { readonly name: string; readonly version: string };
  readonly connector: string;
  readonly subject: {
    readonly type: string;
    readonly attributes: readonly SubjectAttributeValue[];
  };
  readonly requester: string;
};

/** The raw outbound request actually assembled, mirrored from testConnectorRequestEchoSchema. */
export type TestConnectorRequestEcho = {
  readonly method: string;
  readonly address: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

/** The raw outcome of the one call actually issued, mirrored from testConnectorOutcomeSchema -- never reclassified, so a timeout or a raw error is a distinct case a caller must render as such (criterion 6). */
export type TestConnectorOutcome =
  | {
      readonly kind: "response";
      readonly status: number;
      readonly headers: Readonly<Record<string, string>>;
      readonly body?: unknown;
      readonly elapsedMs: number;
    }
  | { readonly kind: "timed-out"; readonly elapsedMs: number }
  | { readonly kind: "error"; readonly message: string; readonly elapsedMs: number };

/** The whole test-connector response, mirrored from testConnectorResponseSchema. */
export type TestConnectorResult = {
  readonly request: TestConnectorRequestEcho;
  readonly response: TestConnectorOutcome;
};

function capabilityKey(capability: Pick<Capability, "name" | "version">): string {
  return `${capability.name}@${capability.version}`;
}

const GENERIC_TEST_DISPATCH_FAILURE_MESSAGE =
  "The test call could not be sent. Check the selected capability, subject and requester, then try again.";

/** No criterion of this task states a distinct wording for a dispatch failure (see this file's own header comment); every mapped kind falls back to the one generic message above, through error-ui-state.ts's own central registry rather than a hand-checked error.code here. */
const TEST_DISPATCH_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {};

function testDispatchFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return (
      TEST_DISPATCH_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_TEST_DISPATCH_FAILURE_MESSAGE
    );
  }
  return GENERIC_TEST_DISPATCH_FAILURE_MESSAGE;
}

export type TestConnectorPanelState = {
  readonly capabilityOptions: SelectOption[];
  readonly isLoadingCapabilities: boolean;
  readonly isCapabilitiesError: boolean;
  readonly selectedCapabilityKey: string | null;
  readonly selectedCapability: Capability | undefined;
  readonly onSelectCapability: (key: string) => void;
  readonly subjectTypeOptions: SelectOption[];
  readonly subjectType: string;
  readonly onSubjectTypeChange: (value: string) => void;
  readonly attributes: readonly SubjectAttributeRow[];
  readonly onAddAttribute: () => void;
  readonly onRemoveAttribute: (id: string) => void;
  readonly onAttributeChange: (id: string, field: "attribute" | "value", value: string) => void;
  readonly requester: string;
  readonly onRequesterChange: (value: string) => void;
  readonly canTest: boolean;
  readonly isTesting: boolean;
  readonly result: TestConnectorResult | null;
  readonly testError: string | null;
  readonly onTest: () => void;
};

/**
 * Assembles and dispatches one test-connector call for `connector`, the connector
 * configuration this panel is scoped to (criterion 1).
 *
 * `configurationText` -- the connector configuration's own current Configuration text,
 * exactly as ConnectorConfigurationDetailReadyView's own live state.configuration.value
 * holds it -- is threaded in by
 * task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel
 * as pure prop/argument plumbing: that task's own rationale states it "carries an
 * existing value between components without deciding a new fact," so it is accepted
 * here and deliberately left unread. Reading it to reconcile `attributes` against
 * Configuration's own current placeholders is a distinct, not-yet-cut change (this
 * hook's own onAddAttribute below still only appends one empty row, unchanged).
 */
export function useTestConnectorPanel(
  connector: string,
  configurationText: string,
): TestConnectorPanelState {
  // Held in a ref, never read through `.current` anywhere in this hook today --
  // this is the accepted-but-unread plumbing this function's own header comment
  // above describes, and holding it this way (rather than a bare `void
  // configurationText`) is what satisfies the strict compiler's
  // noUnusedParameters for an argument nothing yet consumes, mirroring this same
  // file's own nextRowIdRef/isDispatchingRef ref convention below.
  const configurationTextRef = useRef(configurationText);
  configurationTextRef.current = configurationText;

  const {
    capabilities,
    isLoading: isLoadingCapabilities,
    isError: isCapabilitiesError,
  } = useCapabilities();
  const { options: subjectTypeOptions } = useGlossaryVocabularyOptions("subject-type");

  const [selectedCapabilityKey, setSelectedCapabilityKey] = useState<string | null>(null);
  const [subjectType, setSubjectType] = useState("");
  const [attributes, setAttributes] = useState<SubjectAttributeRow[]>([]);
  const [requester, setRequester] = useState("");
  const [testError, setTestError] = useState<string | null>(null);

  const nextRowIdRef = useRef(0);
  const isDispatchingRef = useRef(false);

  // criterion 1: only capabilities currently registered with this connector
  // configuration's own name as their connector are offered.
  const capabilityOptions: SelectOption[] = capabilities
    .filter((capability) => capability.connector === connector)
    .map((capability) => ({
      value: capabilityKey(capability),
      label: `${capability.name} (${capability.version})`,
    }));

  const selectedCapability = capabilities.find(
    (capability) => capabilityKey(capability) === selectedCapabilityKey,
  );

  const mutation = useMutation({
    mutationFn: (body: TestConnectorRequestBody) =>
      apiFetch<TestConnectorResult>("/v1/test-connector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  });

  const hasCompleteAttribute =
    attributes.length > 0 &&
    attributes.every((row) => row.attribute.trim() !== "" && row.value.trim() !== "");

  const canTest =
    selectedCapability !== undefined &&
    subjectType !== "" &&
    hasCompleteAttribute &&
    requester.trim() !== "";

  const onTest = (): void => {
    if (!canTest || selectedCapability === undefined || isDispatchingRef.current) {
      return;
    }
    isDispatchingRef.current = true;
    setTestError(null);

    const body: TestConnectorRequestBody = {
      capability: { name: selectedCapability.name, version: selectedCapability.version },
      connector,
      subject: {
        type: subjectType,
        attributes: attributes.map(({ attribute, value }) => ({ attribute, value })),
      },
      requester,
    };

    mutation.mutate(body, {
      onError: (error) => {
        setTestError(testDispatchFailureMessage(error));
      },
      onSettled: () => {
        isDispatchingRef.current = false;
      },
    });
  };

  return {
    capabilityOptions,
    isLoadingCapabilities,
    isCapabilitiesError,
    selectedCapabilityKey,
    selectedCapability,
    onSelectCapability: setSelectedCapabilityKey,
    subjectTypeOptions,
    subjectType,
    onSubjectTypeChange: setSubjectType,
    attributes,
    onAddAttribute: () => {
      nextRowIdRef.current += 1;
      const id = `test-connector-attribute-row-${nextRowIdRef.current}`;
      setAttributes((current) => [...current, { id, attribute: "", value: "" }]);
    },
    onRemoveAttribute: (id) => {
      setAttributes((current) => current.filter((row) => row.id !== id));
    },
    onAttributeChange: (id, field, value) => {
      setAttributes((current) =>
        current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    requester,
    onRequesterChange: setRequester,
    canTest,
    isTesting: mutation.isPending,
    result: mutation.data ?? null,
    testError,
    onTest,
  };
}
