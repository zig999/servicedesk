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
import { subjectPlaceholderNamesInConfiguration } from "../services/simulation-subject-derivation";
import { isPlainRecord } from "../shared/services/plain-record";
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

/**
 * useTestConnectorPanel's own local dispatch-outcome state
 * (task/connector-test-panel-dispatch-state/discriminate-test-dispatch-outcome):
 * one discriminated union in place of three independent isTesting/result/testError
 * fields, so a stale successful result from a previous call and a fresh error from
 * a more recent one can never both be read at once -- the type's own structure makes
 * that combination unrepresentable rather than merely avoided by careful sequencing
 * (setTestOutcome below is the only writer, and every write replaces the whole
 * union rather than one of three independently-settable fields). Distinct from
 * TestConnectorOutcome above (testConnectorOutcomeSchema's own wire shape,
 * mirroring what the one dispatched HTTP call itself returned): this union
 * describes the panel's own local state across one or more dispatches, not any one
 * call's own raw outcome -- "succeeded" carries the whole TestConnectorResult
 * (request echo and response together, criterion 7's own in-memory-only render),
 * and "failed" carries this hook's own user-facing message
 * (testDispatchFailureMessage above), never a raw error. Tagged `kind` rather than
 * `phase` (this app's own convention for a route's one-shot load lifecycle, e.g.
 * use-connector-configuration-detail.ts's ConnectorConfigurationDetailState) since
 * this describes a repeatable dispatch outcome, not a screen's own load phase --
 * `kind` instead mirrors TestConnectorOutcome's own tag immediately above, the
 * closer precedent for an outcome of one dispatched call (this hook's own
 * inference; see this task's delivery record).
 */
export type TestDispatchOutcome =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "succeeded"; readonly result: TestConnectorResult }
  | { readonly kind: "failed"; readonly error: string };

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
  readonly testOutcome: TestDispatchOutcome;
  readonly onTest: () => void;
};

/**
 * Whether `configurationText` parses as a well-formed JSON object -- the same shape
 * domain/integration/connector-configuration requires of a registered configuration's own
 * text, checked here through shared/services/plain-record.ts's own isPlainRecord rather
 * than a private typeof/null/Array.isArray expression of this file's own
 * (task/connector-test-panel-placeholder-attributes/deduplicate-configuration-object-check
 * -- this file used to mirror simulation-subject-derivation.ts's own JSON.parse-then-
 * plain-object gate by hand because neither file exported a shared primitive to call;
 * both now call this one). Checked independently of
 * subjectPlaceholderNamesInConfiguration's own defensive read below: that function
 * already returns an empty array both for text that fails this check and for text that
 * parses fine but simply embeds no placeholder, and the two are not the same fact --
 * this task's own sixth criterion asks for the rows to be left exactly as they were only
 * in the first case, so onAddAttribute below gates on this check first rather than
 * inferring "no placeholders" from subjectPlaceholderNamesInConfiguration's own return
 * value (this hook's own inference).
 */
function parsesAsConfigurationObject(configurationText: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return false;
  }
  return isPlainRecord(parsed);
}

/**
 * Reconciles `currentRows` against `placeholderNames` -- every distinct subject-attribute
 * placeholder name Configuration's own current text embeds, in the order
 * subjectPlaceholderNamesInConfiguration below returns them (address, then query, then
 * headers, then body, each in its own declared key order): a row whose attribute name
 * still names a currently-present placeholder keeps its own id and value unchanged
 * (criterion 2); a placeholder name with no existing row gets exactly one new, empty-
 * valued row (criterion 1); a row whose attribute name matches no currently-present
 * placeholder is dropped (criterion 3); and a name occurring more than once -- whether
 * repeated in `placeholderNames` itself (criterion 5) or carried by two existing rows --
 * collapses to one row, keeping the first occurrence in `placeholderNames`'s own order.
 * Neither criterion states a tie-break for two existing rows sharing one attribute name;
 * keeping the first is this hook's own inference, drawn from the same first-wins
 * determinism deriveRequiredFields already applies to its own attribute-name dedup
 * (services/simulation-subject-derivation.ts) rather than an invented ranking of its own
 * (see this task's delivery record). `createId` mints a fresh, locally-generated id
 * (MNT-04's stable-key convention, never sent over the wire) only for a row this call
 * adds -- a row whose name survives keeps its existing id rather than a freshly minted
 * one, since nothing in this task's criteria calls for churning an unrelated row's own
 * React key on a click that did not touch it (this hook's own inference).
 */
function reconcileAttributeRows(
  currentRows: readonly SubjectAttributeRow[],
  placeholderNames: readonly string[],
  createId: () => string,
): SubjectAttributeRow[] {
  const dedupedNames: string[] = [];
  const seenNames = new Set<string>();
  for (const name of placeholderNames) {
    if (!seenNames.has(name)) {
      seenNames.add(name);
      dedupedNames.push(name);
    }
  }

  const firstRowByAttribute = new Map<string, SubjectAttributeRow>();
  for (const row of currentRows) {
    if (!firstRowByAttribute.has(row.attribute)) {
      firstRowByAttribute.set(row.attribute, row);
    }
  }

  return dedupedNames.map((name) => {
    const existingRow = firstRowByAttribute.get(name);
    return existingRow ?? { id: createId(), attribute: name, value: "" };
  });
}

/**
 * Assembles and dispatches one test-connector call for `connector`, the connector
 * configuration this panel is scoped to (criterion 1).
 *
 * `configurationText` -- the connector configuration's own current Configuration text,
 * exactly as ConnectorConfigurationDetailReadyView's own live state.configuration.value
 * holds it -- is threaded in by
 * task/connector-test-panel-placeholder-attributes/route-configuration-text-to-test-panel
 * as prop/argument plumbing, and is now read by onAddAttribute below
 * (task/connector-test-panel-placeholder-attributes/reconcile-test-panel-attribute-rows):
 * clicking "Add attribute" reconciles `attributes` against every distinct
 * '${subject:<attribute>}' placeholder Configuration's own current text embeds
 * (subjectPlaceholderNamesInConfiguration, services/simulation-subject-derivation.ts --
 * the exact walk this app's own must_not_duplicate convention already names as proven and
 * reused here rather than re-derived), in place of appending one empty row (criteria
 * 1-5, reconcileAttributeRows above). Configuration text that does not parse as a
 * well-formed JSON object at click time leaves `attributes` exactly as it was
 * (criterion 6, parsesAsConfigurationObject above).
 */
export function useTestConnectorPanel(
  connector: string,
  configurationText: string,
): TestConnectorPanelState {
  // Read at click time through .current inside onAddAttribute below, refreshed on
  // every render the same way this file's own nextRowIdRef/isDispatchingRef are held
  // as refs rather than state -- so a click always reconciles against the latest
  // Configuration text this hook was called with, not a stale render's closure.
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
  const [testOutcome, setTestOutcome] = useState<TestDispatchOutcome>({ kind: "idle" });

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
    setTestOutcome({ kind: "pending" });

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
      onSuccess: (data) => {
        setTestOutcome({ kind: "succeeded", result: data });
      },
      onError: (error) => {
        setTestOutcome({ kind: "failed", error: testDispatchFailureMessage(error) });
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
      // Criterion 6: text that does not parse as a well-formed JSON object at
      // click time leaves `attributes` exactly as it was -- no read, no
      // reconciliation, no state update at all.
      if (!parsesAsConfigurationObject(configurationTextRef.current)) {
        return;
      }
      const placeholderNames = subjectPlaceholderNamesInConfiguration(
        configurationTextRef.current,
      );
      // Read `attributes` directly from this render's own state (the same
      // snapshot hasCompleteAttribute/canTest above already read), rather than
      // through setAttributes's updater form: the number of ids this click
      // mints depends on the diff against that snapshot, and minting them
      // inside an updater would risk nextRowIdRef incrementing more than once
      // for one click under a double-invoking renderer.
      const reconciled = reconcileAttributeRows(attributes, placeholderNames, () => {
        nextRowIdRef.current += 1;
        return `test-connector-attribute-row-${nextRowIdRef.current}`;
      });
      setAttributes(reconciled);
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
    testOutcome,
    onTest,
  };
}
