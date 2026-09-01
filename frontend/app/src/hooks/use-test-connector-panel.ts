import { useRef, useState } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import type { SelectOption } from "@tui/ui/select";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import { subjectPlaceholderNamesInConfiguration } from "../services/simulation-subject-derivation";
import { isPlainRecord } from "../shared/services/plain-record";
import { useCapabilities, type Capability } from "./use-capabilities";
import { useGlossaryVocabularyOptions } from "./use-glossary-vocabulary";

export type SubjectAttributeValue = {
  readonly attribute: string;
  readonly value: string;
};

export type SubjectAttributeRow = SubjectAttributeValue & {
  readonly id: string;
};

export type TestConnectorRequestBody = {
  readonly capability: { readonly name: string; readonly version: string };
  readonly connector: string;
  readonly subject: {
    readonly type: string;
    readonly attributes: readonly SubjectAttributeValue[];
  };
  readonly requester: string;
};

export type TestConnectorRequestEcho = {
  readonly method: string;
  readonly address: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: unknown;
};

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

export type TestConnectorResult = {
  readonly request: TestConnectorRequestEcho;
  readonly response: TestConnectorOutcome;
};

function capabilityKey(capability: Pick<Capability, "name" | "version">): string {
  return `${capability.name}@${capability.version}`;
}

const GENERIC_TEST_DISPATCH_FAILURE_MESSAGE =
  "The test call could not be sent. Check the selected capability, subject and requester, then try again.";

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

export type TestDispatchOutcome =
  | { readonly kind: "idle" }
  | { readonly kind: "pending" }
  | { readonly kind: "succeeded"; readonly result: TestConnectorResult }
  | { readonly kind: "failed"; readonly message: string };

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

function parsesAsConfigurationObject(configurationText: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return false;
  }
  return isPlainRecord(parsed);
}

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

function testOutcomeFromMutation(
  mutation: UseMutationResult<TestConnectorResult, Error, TestConnectorRequestBody>,
): TestDispatchOutcome {
  switch (mutation.status) {
    case "idle":
      return { kind: "idle" };
    case "pending":
      return { kind: "pending" };
    case "success":
      return { kind: "succeeded", result: mutation.data };
    case "error":
      return { kind: "failed", message: testDispatchFailureMessage(mutation.error) };
  }
}

export function useTestConnectorPanel(
  connector: string,
  configurationText: string,
): TestConnectorPanelState {

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

  const nextRowIdRef = useRef(0);
  const isDispatchingRef = useRef(false);

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

    mutation.reset();

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
      onSettled: () => {
        isDispatchingRef.current = false;
      },
    });
  };

  const testOutcome = testOutcomeFromMutation(mutation);

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

      if (!parsesAsConfigurationObject(configurationTextRef.current)) {
        return;
      }
      const placeholderNames = subjectPlaceholderNamesInConfiguration(
        configurationTextRef.current,
      );

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
