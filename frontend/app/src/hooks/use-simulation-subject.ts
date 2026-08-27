/**
 * task/subject-derivation/use-simulation-subject-hook: for a given case
 * version, the full set of subject fields a simulation requires -- one per
 * distinct '${subject:<attribute>}' placeholder reachable from the version's
 * own collection plan through the capability and connector-configuration
 * registries (criteria 1-3, services/simulation-subject-derivation.ts's own
 * deriveRequiredFields) -- plus the operator-facing state that fills them
 * in and the curator-added attributes on top (criterion 4), and reports
 * whether the assembled subject is complete enough to simulate (criteria
 * 5-6).
 *
 * Composes useCapabilities() and useConnectorConfigurations() rather than
 * re-deriving either registry read -- this app's own established
 * must_not_duplicate convention
 * (work/case-simulation-frontend/inventory/case-simulation-frontend-area.md)
 * -- and is this app's first consumer of both together for a purpose other
 * than browsing them (use-test-connector-panel.ts composes only
 * useCapabilities, for a one-shot dispatch rather than a derivation).
 *
 * A one-shot dispatch (use-test-connector-panel.ts's own established
 * convention) holds its subject as plain component state, not
 * react-hook-form; this hook holds the same shape of state for the same
 * reason -- the assembled subject is never a stored, validated resource of
 * its own, and each derived required field's own value is a single
 * controlled input, not a form with its own submission lifecycle. Every
 * curator-added row reuses use-test-connector-panel.ts's own
 * SubjectAttributeRow/SubjectAttributeValue shape (attribute, value, and a
 * locally generated `id` only so the row list can be keyed stably rather
 * than by array index, MNT-04) rather than redeclaring an identical pair
 * type.
 *
 * Called once by the screen this epic's own sibling tasks build
 * (case-simulation-screen.tsx, outside this task's own candidate set) and
 * its returned `subject`/`isReady` shared between a full-case run and a
 * single-hypothesis run -- one subject, shared, per D7 (criterion 7,
 * contracts/investigation/case-simulation): this hook never distinguishes
 * the two itself, and a caller composing both a full-case dispatch and a
 * per-hypothesis dispatch against the one instance this hook returns is what
 * keeps the derived subject and its readiness identical between them.
 */

import { useMemo, useRef, useState } from "react";
import { useCapabilities } from "./use-capabilities";
import { useConnectorConfigurations } from "./use-connector-configurations";
import type { SubjectAttributeRow, SubjectAttributeValue } from "./use-test-connector-panel";
import {
  deriveRequiredFields,
  type DerivedSubjectField,
} from "../services/simulation-subject-derivation";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

/**
 * The slice of a case version's own read this hook needs to derive a
 * subject from (domain/knowledge/case-version): its own declared subject
 * type (domain/investigation/subject's own `type`, read here directly from
 * the version rather than derived -- the version's `subject` attribute is
 * already that value) and its manifest, whose every entry's own
 * hypothesis-revision `collects` derives the collection plan
 * (simulation-subject-derivation.ts's own collectionPlanFromManifest).
 * CaseVersionRecord's wider shape (title, when_to_use, fallback...) is
 * deliberately left unread here, the same narrowing convention
 * use-capabilities.ts's own header comment names for ConceptOption.
 */
export type SimulationSubjectSource = {
  readonly subject: string;
  readonly manifest?: readonly CaseVersionManifestEntry[];
};

/** One derived required field as this hook exposes it for editing: simulation-subject-derivation.ts's own static DerivedSubjectField (attribute, connector, capability, hint) paired with the value currently typed into it and the setter that changes it. */
export type SimulationRequiredField = DerivedSubjectField & {
  readonly value: string;
  readonly onChange: (value: string) => void;
};

/** domain/investigation/subject, assembled from this version's derived required fields plus whatever the curator has added on top (criterion 4, domain/investigation/subject-attribute-value): one attribute name paired with one value, never duplicated, and never carrying an entry whose value is still empty. */
export type SimulationSubject = {
  readonly type: string;
  readonly attributes: readonly SubjectAttributeValue[];
};

export type SimulationSubjectState = {
  readonly requiredFields: readonly SimulationRequiredField[];
  readonly requester: string;
  readonly onRequesterChange: (value: string) => void;
  readonly addedAttributes: readonly SubjectAttributeRow[];
  readonly onAddAttribute: () => void;
  readonly onRemoveAttribute: (id: string) => void;
  readonly onAttributeChange: (id: string, field: "attribute" | "value", value: string) => void;
  readonly subject: SimulationSubject;
  readonly isReady: boolean;
  /** Whether the capability and/or connector-configuration registries this derivation reads are still loading -- a caller degrading to a loading state (EDG-01) reads this rather than treating an incomplete `requiredFields` as final. */
  readonly isLoadingRegistries: boolean;
  /** Whether either registry this derivation reads failed to load -- a caller degrading to a load-error state (EDG-02) reads this. */
  readonly isRegistriesError: boolean;
};

/** Builds the merged attribute map criterion 4 requires -- one attribute name paired with one value, drawn from every derived required field that currently holds a non-empty value, then from every curator-added row that names a non-empty attribute and holds a non-empty value. A curator-added row sharing a derived field's own attribute name overrides that field's own typed value rather than adding a second entry for the same name (this hook's own inference, uncovered by any criterion naming a tie-break; see this task's delivery record). */
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

/** Derives, for `version`, the full set of subject fields a simulation requires, and holds the state that fills them in (this file's own header comment). */
export function useSimulationSubject(version: SimulationSubjectSource): SimulationSubjectState {
  const {
    capabilities,
    isLoading: isLoadingCapabilities,
    isError: isCapabilitiesError,
  } = useCapabilities();
  const {
    connectorConfigurations,
    isLoading: isLoadingConnectorConfigurations,
    isError: isConnectorConfigurationsError,
  } = useConnectorConfigurations();

  // PRF-02: memoized because this walk parses every resolved connector's own
  // configuration text and scans it for placeholders -- a cost worth paying
  // once per actual registry/manifest change rather than on every keystroke
  // a required field's own onChange below triggers.
  const definitions = useMemo(
    () =>
      deriveRequiredFields({
        manifest: version.manifest,
        capabilities,
        connectorConfigurations,
      }),
    [version.manifest, capabilities, connectorConfigurations],
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
    type: version.subject,
    attributes: mergedAttributes(requiredFields, addedAttributes),
  };

  // Criteria 5-6: readiness is false while the requester or any derived
  // required field is empty, and never true for a subject holding zero
  // attribute-values -- even where the collection plan derives no required
  // field and the curator has added none
  // (rules/investigation/a-subject-carries-at-least-one-attribute).
  const isReady =
    requester.trim() !== "" &&
    requiredFields.every((field) => field.value.trim() !== "") &&
    subject.attributes.length > 0;

  return {
    requiredFields,
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
    isLoadingRegistries: isLoadingCapabilities || isLoadingConnectorConfigurations,
    isRegistriesError: isCapabilitiesError || isConnectorConfigurationsError,
  };
}
