import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import { useGlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";
import type { SimulationSubjectState } from "../hooks/use-simulation-subject";

export type CaseSimulationSubjectPanelProps = {
  readonly state: SimulationSubjectState;
};

function doNotChangeSubjectType(): void {}

export function CaseSimulationSubjectPanel({
  state,
}: CaseSimulationSubjectPanelProps): JSX.Element {
  const {
    options: subjectTypeOptions,
    isLoading: isLoadingSubjectTypeOptions,
    isError: isSubjectTypeOptionsError,
    refetch: refetchSubjectTypeOptions,
  } = useGlossaryVocabularyOptions("subject-type");

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
                          className="text-sm text-muted-foreground break-words"
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
    </section>
  );
}
