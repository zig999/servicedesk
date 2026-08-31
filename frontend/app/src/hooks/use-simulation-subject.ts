/**
 * task/subject-input-requirements/derive-subject-fields-from-input-requirements: for the
 * pinned case version (`slug`, `version`), the full set of editable subject fields a
 * simulation presents -- one per case-input-requirement useCaseInputRequirements(slug,
 * version) names, required and optional alike (contracts/knowledge/case-input-requirements,
 * rules/investigation/a-composed-subject-presents-every-case-input-requirement) -- plus the
 * operator-facing state that fills them in and the curator-added attributes on top, and
 * reports whether the assembled subject is complete enough to simulate.
 *
 * Supersedes this hook's own earlier derivation, which scanned every resolved connector's
 * own configuration text for '${subject:<attribute>}' placeholders
 * (services/simulation-subject-derivation.ts's own former deriveRequiredFields and
 * collectionPlanFromManifest, both gone from the tree now, criteria 11 and 13): the
 * case-input-requirements read is the authoritative set (domain/knowledge/case-input-
 * requirement), and it names an attribute the case cannot be diagnosed without even where no
 * connector configuration's own call ever embeds it as a placeholder literally
 * (scenarios/investigation/a-simulate-screen-presents-an-undetected-required-attribute,
 * criterion 7) -- something the placeholder scan could never have surfaced by construction.
 *
 * Composes useCaseInputRequirements(slug, version) and useCapabilities() rather than
 * re-deriving either registry read -- this app's own established must_not_duplicate
 * convention (work/case-simulation-frontend/inventory/case-simulation-frontend-area.md) --
 * and no longer composes useConnectorConfigurations at all, since nothing this hook derives
 * from here on reads a connector configuration's own text (criterion 10): this hook's own
 * isLoadingRegistries/isRegistriesError now report exactly those two composed reads instead.
 * `slug`/`version` are received as this hook's own arguments and threaded straight into
 * useCaseInputRequirements the same way use-case-simulation-cockpit.ts already threads them
 * into useSimulateHypothesis(slug, version) -- plain positional arguments naming the pinned
 * case version's own identity, never wrapped inside SimulationSubjectSource, whose own
 * `manifest` field this task's own removal of collectionPlanFromManifest leaves nothing here
 * to read either (this hook's own inference; its one call site, use-case-simulation-
 * cockpit.ts, is updated alongside so `useSimulationSubject` is never called with a stale
 * three-argument-missing signature -- a mechanical, same-line follow-on this task's own
 * inference judges necessary for the tree to build, not a rewrite of that file's own cross-
 * region logic).
 *
 * A one-shot dispatch (use-test-connector-panel.ts's own established convention) holds its
 * subject as plain component state, not react-hook-form; this hook holds the same shape of
 * state for the same reason -- the assembled subject is never a stored, validated resource of
 * its own, and each derived field's own value is a single controlled input, not a form with
 * its own submission lifecycle. Every curator-added row reuses use-test-connector-panel.ts's
 * own SubjectAttributeRow/SubjectAttributeValue shape (attribute, value, and a locally
 * generated `id` only so the row list can be keyed stably rather than by array index,
 * MNT-04) rather than redeclaring an identical pair type.
 *
 * Called once by the screen this epic's own sibling tasks build
 * (case-simulation-screen.tsx, outside this task's own candidate set) and its returned
 * `subject`/`isReady` shared between a full-case run and a single-hypothesis run -- one
 * subject, shared, per D7 (contracts/investigation/case-simulation): this hook never
 * distinguishes the two itself, and a caller composing both a full-case dispatch and a
 * per-hypothesis dispatch against the one instance this hook returns is what keeps the
 * derived subject and its readiness identical between them.
 *
 * `isReady`'s own gating still reads every entry in `requiredFields` (unchanged, this task's
 * own "do not touch the dispatch gating" boundary) even though that array now also carries a
 * requirement this read names optional (criterion 1: "required and optional alike") --
 * rules/investigation/a-composed-subject-presents-every-case-input-requirement's own clause
 * that "only a required flag, never an attribute's mere presence in this set, gates whether
 * its own input blocks the call" reaches no criterion of this task (this task's own Notes,
 * REMAINDER); it belongs to the sibling task that gates the simulate-case and
 * simulate-hypothesis dispatch on the composed fields, which this hook's own `required` flag
 * on each field (carried through unchanged, criterion 2) is what that task reads.
 */

import { useMemo, useRef, useState } from "react";
import { useCapabilities } from "./use-capabilities";
import { useCaseInputRequirements } from "./use-case-input-requirements";
import type { SubjectAttributeRow, SubjectAttributeValue } from "./use-test-connector-panel";
import {
  deriveSubjectFields,
  type DerivedSubjectField,
} from "../services/simulation-subject-derivation";

/**
 * The slice of a case version's own read this hook needs beyond its pinned identity
 * (domain/knowledge/case-version): its own declared subject type
 * (domain/investigation/subject's own `type`, read here directly from the version rather than
 * derived -- the version's `subject` attribute is already that value). CaseVersionRecord's
 * wider shape (title, when_to_use, manifest, fallback...) is deliberately left unread here,
 * the same narrowing convention use-capabilities.ts's own header comment names for
 * ConceptOption -- the manifest is no longer read by this hook at all now that
 * collectionPlanFromManifest is gone (this task's own criterion 11); the case-input-
 * requirements read replaces it as the authoritative source of what this hook derives.
 */
export type SimulationSubjectSource = {
  readonly subject: string;
};

/** One derived field as this hook exposes it for editing: simulation-subject-derivation.ts's own static DerivedSubjectField (attribute, required, capabilities) paired with the value currently typed into it and the setter that changes it. */
export type SimulationRequiredField = DerivedSubjectField & {
  readonly value: string;
  readonly onChange: (value: string) => void;
};

/** domain/investigation/subject, assembled from this version's derived fields plus whatever the curator has added on top (domain/investigation/subject-attribute-value): one attribute name paired with one value, never duplicated, and never carrying an entry whose value is still empty. */
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
  /** Whether the case-input-requirements and/or capability registries this derivation reads are still loading -- a caller degrading to a loading state (EDG-01) reads this rather than treating an incomplete `requiredFields` as final. */
  readonly isLoadingRegistries: boolean;
  /** Whether either read this derivation reads failed to load -- a caller degrading to a load-error state (EDG-02) reads this. */
  readonly isRegistriesError: boolean;
};

/** Builds the merged attribute map criterion 4 requires -- one attribute name paired with one value, drawn from every derived field that currently holds a non-empty value, then from every curator-added row that names a non-empty attribute and holds a non-empty value. A curator-added row sharing a derived field's own attribute name overrides that field's own typed value rather than adding a second entry for the same name (this hook's own inference, uncovered by any criterion naming a tie-break; see this task's delivery record). */
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

/** Derives, for the pinned case version (`slug`, `version`) and `source`, the full set of editable subject fields (this file's own header comment), and holds the state that fills them in. */
export function useSimulationSubject(
  source: SimulationSubjectSource,
  slug: string,
  version: number,
): SimulationSubjectState {
  const {
    requirements,
    isLoading: isLoadingCaseInputRequirements,
    isError: isCaseInputRequirementsError,
  } = useCaseInputRequirements(slug, version);
  const {
    capabilities,
    isLoading: isLoadingCapabilities,
    isError: isCapabilitiesError,
  } = useCapabilities();

  // PRF-02: memoized so this map/enrich walk runs once per actual registry/manifest change
  // rather than on every keystroke a required field's own onChange below triggers.
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

  // Criteria 5-6: readiness is false while the requester or any derived required field is
  // empty, and never true for a subject holding zero attribute-values -- even where the
  // derivation names no field at all
  // (rules/investigation/a-subject-carries-at-least-one-attribute). Unchanged by this task
  // (this file's own header comment on the dispatch-gating boundary).
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
    isLoadingRegistries: isLoadingCaseInputRequirements || isLoadingCapabilities,
    isRegistriesError: isCaseInputRequirementsError || isCapabilitiesError,
  };
}
