import { useMemo, useState } from "react";
import { useCapabilities } from "./use-capabilities";
import {
  useCaseInputRequirements,
  type CapabilityReference,
} from "./use-case-input-requirements";
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

export type SimulationSubjectAttribute = {
  readonly attribute: string;
  readonly value: string;
};

export type SimulationSubject = {
  readonly type: string;
  readonly attributes: readonly SimulationSubjectAttribute[];
};

export type SimulationSubjectState = {
  readonly requiredFields: readonly SimulationRequiredField[];

  readonly capabilitiesWithMalformedInputSchema: readonly CapabilityReference[];
  readonly requester: string;
  readonly onRequesterChange: (value: string) => void;
  readonly subject: SimulationSubject;
  readonly isReady: boolean;

  readonly isLoadingRegistries: boolean;

  readonly isRegistriesError: boolean;
};

function composedAttributes(
  requiredFields: readonly SimulationRequiredField[],
): readonly SimulationSubjectAttribute[] {
  const attributeMap = new Map<string, string>();
  for (const field of requiredFields) {
    if (field.value.trim() === "" || attributeMap.has(field.attribute)) {
      continue;
    }
    attributeMap.set(field.attribute, field.value);
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

  const requiredFields: SimulationRequiredField[] = definitions.map((definition) => ({
    ...definition,
    value: values[definition.attribute] ?? "",
    onChange: (value: string) => {
      setValues((current) => ({ ...current, [definition.attribute]: value }));
    },
  }));

  const subject: SimulationSubject = {
    type: source.subject,
    attributes: composedAttributes(requiredFields),
  };

  const isReady = requester.trim() !== "" && subject.attributes.length > 0;

  return {
    requiredFields,
    capabilitiesWithMalformedInputSchema,
    requester,
    onRequesterChange: setRequester,
    subject,
    isReady,
    isLoadingRegistries: isLoadingCaseInputRequirements || isLoadingCapabilities,
    isRegistriesError: isCaseInputRequirementsError || isCapabilitiesError,
  };
}
