import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select, type SelectOption } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import { useGlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { SimulationSubjectState } from "../hooks/use-simulation-subject";

export type CaseSimulationSubjectPanelProps = {
  readonly state: SimulationSubjectState;
};

function doNotChangeSubjectType(): void {
  // No-op: the version's own declared subject type has no setter on
  // useSimulationSubject's returned state.
}

function availableAttributeOptions(
  allOptions: readonly SelectOption[],
  requiredFields: SimulationSubjectState["requiredFields"],
): SelectOption[] {
  const requiredAttributeNames = new Set(requiredFields.map((field) => field.attribute));
  return allOptions.filter((option) => !requiredAttributeNames.has(option.value));
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
  const availableSubjectAttributeOptions = availableAttributeOptions(
    subjectAttributeOptions,
    state.requiredFields,
  );

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
                options={availableSubjectAttributeOptions}
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
