import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import { useGlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { SimulationSubjectState } from "../hooks/use-simulation-subject";

/**
 * The Subject region of the simulation cockpit's layout
 * (task/subject-derivation/subject-panel, layout/simulation-screen.md's own
 * "Subject (D7)" section): the subject type, the requester, one input per
 * case-input-requirement the composed state exposes -- required and optional
 * alike, the required ones marked as such -- each annotated with every
 * currently-registered capability that asks for it (its own name, version
 * and connector, never only one where more than one asks) and that
 * capability's own input_schema as a free-text hint where the state carries
 * one (task/subject-input-requirements/present-each-requirement-with-its-
 * required-standing, rules/investigation/a-composed-subject-presents-every-
 * case-input-requirement), a curator "add attribute" control drawn from the
 * subject-attribute glossary, and a link to view the assembled subject as
 * raw JSON.
 *
 * Also discloses, in its own section right below the requirement list, every
 * capability state.capabilitiesWithMalformedInputSchema names -- by its own
 * name and version alone, never its connector or answered concept
 * (domain/knowledge/case-input-requirement, rules/investigation/a-composed-
 * subjects-interface-discloses-a-malformed-capability, task/subject-input-
 * requirements/disclose-malformed-capabilities-to-the-curator) -- so a
 * curator can see why a concept in this version's plan is asking them for
 * nothing at all. This disclosure gates and removes nothing from the
 * requirement list above or from either dispatch, and a read naming no such
 * capability renders nothing here at all, not even an empty-state message
 * the way the requirement list states its own emptiness explicitly.
 *
 * Presentational and props-driven (ARC-02/ARC-03), mirroring
 * connector-test-panel-fields.tsx's own established shape for a hook's whole
 * returned state consumed by a fields component: every field, handler and
 * the assembled subject/readiness themselves come from `state`
 * (task/subject-derivation/use-simulation-subject-hook's own
 * useSimulationSubject, already delivered), never recomputed here. Unlike
 * this epic's other region tasks (header, hypotheses-table, detail-panel),
 * this task's own `depends_on` names that hook directly, and D7's own "one
 * subject, shared" requirement (contracts/investigation/case-simulation)
 * is exactly why this component does not call useSimulationSubject itself:
 * that hook's own header comment states it is "called once by the screen"
 * so its one returned subject/isReady can be shared with a full-case
 * dispatch and a per-hypothesis dispatch alike -- a second call site here
 * would create a second, independent subject. task/simulation-cockpit/
 * screen-assembly is the one call site, and passes its result down as
 * `state`.
 *
 * The subject-type and subject-attribute vocabularies are read directly
 * here through useGlossaryVocabularyOptions, the same way
 * glossary-browser-screen.tsx's own VocabularyPanel composes that hook
 * directly inside a component rather than through an intermediate hook of
 * its own -- these two reads need no sharing across regions the way the
 * derived subject does, so composing them here (react-query's own cache
 * already de-duplicates a second caller of the same vocabulary) follows
 * that precedent rather than inventing a second convention.
 *
 * Criterion 1 ("the subject type is chosen from the glossary's
 * subject-type vocabulary ... never typed as free text") is read as a fact
 * about provenance and control kind, not about this screen offering a new
 * choice: domain/investigation/subject's own Description states "the case
 * itself declares only the subject type" -- already fixed to a
 * glossary-governed value when the version was authored -- and the hook
 * this component depends on exposes no setter for it
 * (SimulationSubjectState carries no onSubjectTypeChange). It is therefore
 * rendered through the same Select control layout/simulation-screen.md's
 * own "[<glossary> ▾]" notation depicts (a reference decides form, never
 * fact), populated from the glossary's own vocabulary, with a documented
 * no-op change handler -- `doNotChangeSubjectType`, the same naming
 * convention case-simulation-ready-view.tsx's own `doNotDispatchSimulateCase`
 * already establishes for a control this delivery wires to nothing because
 * nothing in its own dependency exposes a real handler -- rather than a
 * `disabled` prop this delivery cannot verify @tui/ui/select actually
 * accepts (frontend/tui is an uninitialized submodule in this worktree; see
 * this task's own delivery record).
 *
 * Criterion 5's own "never an arbitrary typed name" is why the curator's
 * own "add attribute" row uses a Select bound to
 * useGlossaryVocabularyOptions("subject-attribute") for its attribute name,
 * departing from use-test-connector-panel.ts's own established free-text
 * Input for the identical-looking row shape (SubjectAttributeRow) -- that
 * precedent predates this criterion and answers a different contract
 * (test-connector.dto.ts's own subject, which this task's own criteria do
 * not constrain the same way).
 *
 * "View subject JSON" reuses this epic's own already-established
 * <details>/<summary> convention for a collapsible raw block
 * (case-simulation-detail-evidence-tab.tsx, task/simulation-cockpit/
 * detail-panel's own delivery record, which confirmed no TUI catalog
 * disclosure/accordion primitive exists) rather than a bespoke toggle.
 */

export type CaseSimulationSubjectPanelProps = {
  readonly state: SimulationSubjectState;
};

/**
 * The subject-type Select's own change handler: a documented no-op, since
 * SimulationSubjectState exposes no setter for `subject.type` (see this
 * file's own header comment). Named after case-simulation-ready-view.tsx's
 * own `doNotDispatchSimulateCase`, the same convention for a control this
 * delivery renders but cannot wire to a real handler.
 */
function doNotChangeSubjectType(): void {
  // No-op: the version's own declared subject type has no setter on
  // useSimulationSubject's returned state.
}

export function CaseSimulationSubjectPanel({
  state,
}: CaseSimulationSubjectPanelProps): JSX.Element {
  const {
    options: subjectTypeOptions,
    isLoading: isLoadingSubjectTypeOptions,
    isError: isSubjectTypeOptionsError,
    refetch: refetchSubjectTypeOptions,
  } = useGlossaryVocabularyOptions("subject-type");
  const {
    options: subjectAttributeOptions,
    isLoading: isLoadingSubjectAttributeOptions,
    isError: isSubjectAttributeOptionsError,
    refetch: refetchSubjectAttributeOptions,
  } = useGlossaryVocabularyOptions("subject-attribute");

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Subject</h2>

      <div className="grid grid-cols-2 gap-4">
        <Label className="flex flex-col gap-1">
          Type
          <Select
            options={subjectTypeOptions}
            value={state.subject.type}
            onChange={doNotChangeSubjectType}
          />
        </Label>
        <div className="flex flex-col gap-1">
          <Label htmlFor="case-simulation-subject-requester">Requester</Label>
          <Input
            id="case-simulation-subject-requester"
            value={state.requester}
            onChange={(event) => state.onRequesterChange(event.target.value)}
          />
        </div>
      </div>
      {isLoadingSubjectTypeOptions && <p>Loading subject types…</p>}
      {isSubjectTypeOptionsError && (
        <section>
          <p role="alert" className="text-sm text-destructive">
            Could not load the subject-type glossary.
          </p>
          <Button type="button" onClick={refetchSubjectTypeOptions}>
            Retry
          </Button>
        </section>
      )}

      {state.isLoadingRegistries && (
        <p>Loading the connectors and capabilities this version needs…</p>
      )}
      {state.isRegistriesError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load the capability and connector registries this subject is derived from.
        </p>
      )}
      {!state.isLoadingRegistries && !state.isRegistriesError && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Required by the connectors:</p>
          {state.requiredFields.length === 0 ? (
            // task/subject-input-requirements/present-each-requirement-with-its-required-
            // standing, criterion 5 (rules/investigation/a-composed-subject-presents-every-
            // case-input-requirement's own closing clause, and API-04): an empty read states
            // that emptiness explicitly, in the rule's own terms, rather than a bare empty
            // list or a generic "nothing to show" placeholder.
            <p className="text-sm text-muted-foreground">
              The pinned case version&apos;s own case-input-requirements name no attribute.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {state.requiredFields.map((field) => (
                <li key={field.attribute} className="flex flex-col gap-1">
                  {/* Criteria 2-3: a required requirement's own input is marked, an optional
                      one is not -- no existing convention for this in the codebase (this
                      task's own disclosed inference), so a plain text asterisk is used
                      alongside the input's own `required` attribute below. It is rendered as a
                      sibling of the Label, never inside it: the Label's own text is what
                      testing-library's getByLabelText matches against exactly, and an
                      aria-hidden span nested inside the Label still contributes to that
                      computed text (aria-hidden only removes a node from the accessible-name
                      algorithm assistive tech reads, not from this string), so an asterisk
                      inside the Label silently changed "account-id" into "account-id *" for
                      every required field's own label match. */}
                  <span className="flex items-center gap-1">
                    <Label htmlFor={`case-simulation-subject-field-${field.attribute}`}>
                      {field.attribute}
                    </Label>
                    {field.required && (
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    )}
                  </span>
                  <Input
                    id={`case-simulation-subject-field-${field.attribute}`}
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    required={field.required}
                  />
                  {field.capabilities.length > 0 && (
                    // Criterion 4: every asking capability this field's own requirement
                    // currently resolves, never only one -- each by its own name, version and
                    // connector, plus its own input-schema hint where the state carries one.
                    <ul className="flex flex-col gap-1">
                      {field.capabilities.map((capability) => (
                        <li
                          key={`${capability.name}-${capability.version}`}
                          className="text-sm text-muted-foreground"
                        >
                          ← {capability.connector} ({capability.name} {capability.version})
                          {capability.inputSchemaHint.trim() !== "" && (
                            <span> — {capability.inputSchemaHint}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!state.isLoadingRegistries &&
        !state.isRegistriesError &&
        state.capabilitiesWithMalformedInputSchema.length > 0 && (
          // Criterion 1 (rules/investigation/a-composed-subjects-interface-
          // discloses-a-malformed-capability, task/subject-input-requirements/
          // disclose-malformed-capabilities-to-the-curator): every capability
          // the case-input-requirements read names apart from the requirement
          // set because its own stored input schema does not currently hold a
          // well-formed shape, disclosed by identity alone -- name and
          // version, never its connector or answered concept (this task's own
          // UNDERDETERMINED note against domain/knowledge/case-input-
          // requirement's "that is the whole of what reaches the person
          // composing a subject about it"). Gated on the same registry-
          // loading/error flags the requirement list above reads, since
          // useCaseInputRequirements resolves this same array to `[]` while
          // either read is unsettled (use-case-input-requirements.ts); an
          // empty array already renders nothing below regardless (criterion
          // 4), so this gate only keeps the section from flashing empty
          // during a load. Renders no heading at all when the array is
          // empty -- never an empty-state message the way the requirement
          // list above states its own emptiness explicitly -- and touches
          // neither the requirement list, the dispatch buttons nor their
          // enabled/disabled state (criteria 2-3).
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Asking for nothing at all — their own stored input schema holds no well-formed shape:
            </p>
            <ul className="flex flex-col gap-1">
              {state.capabilitiesWithMalformedInputSchema.map((capability) => (
                <li
                  key={`${capability.name}-${capability.version}`}
                  className="text-sm text-muted-foreground"
                >
                  {capability.name} {capability.version}
                </li>
              ))}
            </ul>
          </div>
        )}

      <div className="flex flex-col gap-3">
        {state.addedAttributes.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-4">
            <Label className="flex flex-col gap-1">
              Attribute
              <Select
                options={subjectAttributeOptions}
                value={row.attribute}
                onChange={(value) => state.onAttributeChange(row.id, "attribute", value)}
              />
            </Label>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${row.id}-value`}>Value</Label>
              <Input
                id={`${row.id}-value`}
                value={row.value}
                onChange={(event) => state.onAttributeChange(row.id, "value", event.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => state.onRemoveAttribute(row.id)}>
              Remove attribute
            </Button>
          </div>
        ))}
        <div>
          <Button type="button" variant="secondary" onClick={state.onAddAttribute}>
            + attribute
          </Button>
        </div>
        {isLoadingSubjectAttributeOptions && <p>Loading subject attributes…</p>}
        {isSubjectAttributeOptionsError && (
          <section>
            <p role="alert" className="text-sm text-destructive">
              Could not load the subject-attribute glossary.
            </p>
            <Button type="button" onClick={refetchSubjectAttributeOptions}>
              Retry
            </Button>
          </section>
        )}
      </div>

      <details>
        <summary className="cursor-pointer text-sm text-muted-foreground">
          View subject JSON
        </summary>
        <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
          {JSON.stringify(state.subject, null, 2)}
        </pre>
      </details>
    </section>
  );
}
