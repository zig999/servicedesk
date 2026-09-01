import { useMemo, useRef, useState } from "react";
import { useCapabilities } from "./use-capabilities";
import {
  useCaseInputRequirements,
  type CapabilityReference,
} from "./use-case-input-requirements";
import type { SubjectAttributeRow, SubjectAttributeValue } from "./use-test-connector-panel";
import {
  deriveSubjectFields,
  type DerivedSubjectField,
} from "../services/simulation-subject-derivation";

export type SimulationSubjectSource = {
  readonly subject: string;
};

export type SimulationRequiredField = DerivedSubjectField & {
  readonly value: string;
  readonly onChange: (value: string) => void;
};

export type SimulationSubject = {
  readonly type: string;
  readonly attributes: readonly SubjectAttributeValue[];
};

export type SimulationSubjectState = {
  readonly requiredFields: readonly SimulationRequiredField[];

  readonly capabilitiesWithMalformedInputSchema: readonly CapabilityReference[];
  readonly requester: string;
  readonly onRequesterChange: (value: string) => void;
  readonly addedAttributes: readonly SubjectAttributeRow[];
  readonly onAddAttribute: () => void;
  readonly onRemoveAttribute: (id: string) => void;
  readonly onAttributeChange: (id: string, field: "attribute" | "value", value: string) => void;
  readonly subject: SimulationSubject;
  readonly isReady: boolean;

  readonly isLoadingRegistries: boolean;

  readonly isRegistriesError: boolean;
};

function mergedAttributes(
  requiredFields: readonly SimulationRequiredField[],
  addedAttributes: readonly SubjectAttributeRow[],
): readonly SubjectAttributeValue[] {
  const attributeMap = new Map<string, string>();
  for (const field of requiredFields) {
    if (field.value.trim() !== "") {
      attributeMap.set(field.attribute, field.value);
    }
  }
  for (const row of addedAttributes) {
    const attribute = row.attribute.trim();
    if (attribute !== "" && row.value.trim() !== "") {
      attributeMap.set(attribute, row.value);
    }
  }
  return [...attributeMap.entries()].map(([attribute, value]) => ({ attribute, value }));
}

export function useSimulationSubject(
  source: SimulationSubjectSource,
  slug: string,
  version: number,
): SimulationSubjectState {
  const {
    requirements,
    capabilitiesWithMalformedInputSchema,
    isLoading: isLoadingCaseInputRequirements,
    isError: isCaseInputRequirementsError,
  } = useCaseInputRequirements(slug, version);
  const {
    capabilities,
    isLoading: isLoadingCapabilities,
    isError: isCapabilitiesError,
  } = useCapabilities();

  const definitions = useMemo(
    () => deriveSubjectFields({ requirements, capabilities }),
    [requirements, capabilities],
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [requester, setRequester] = useState("");
  const [addedAttributes, setAddedAttributes] = useState<SubjectAttributeRow[]>([]);
  const nextRowIdRef = useRef(0);

  const requiredFields: SimulationRequiredField[] = definitions.map((definition) => ({
    ...definition,
    value: values[definition.attribute] ?? "",
    onChange: (value: string) => {
      setValues((current) => ({ ...current, [definition.attribute]: value }));
    },
  }));

  const subject: SimulationSubject = {
    type: source.subject,
    attributes: mergedAttributes(requiredFields, addedAttributes),
  };

  const isReady = requester.trim() !== "" && subject.attributes.length > 0;

  return {
    requiredFields,
    capabilitiesWithMalformedInputSchema,
    requester,
    onRequesterChange: setRequester,
    addedAttributes,
    onAddAttribute: () => {
      nextRowIdRef.current += 1;
      const id = `simulation-subject-attribute-row-${nextRowIdRef.current}`;
      setAddedAttributes((current) => [...current, { id, attribute: "", value: "" }]);
    },
    onRemoveAttribute: (id) => {
      setAddedAttributes((current) => current.filter((row) => row.id !== id));
    },
    onAttributeChange: (id, field, value) => {
      setAddedAttributes((current) =>
        current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    subject,
    isReady,
    isLoadingRegistries: isLoadingCaseInputRequirements || isLoadingCapabilities,
    isRegistriesError: isCaseInputRequirementsError || isCapabilitiesError,
  };
}
