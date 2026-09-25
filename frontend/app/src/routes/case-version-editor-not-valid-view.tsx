import type { BaseSyntheticEvent, JSX } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { ConflictBanner } from "../shared/components/conflict-banner";
import {
  CASE_VERSION_EDITOR_FORM_ID,
  CaseVersionEditorFormFields,
} from "./case-version-editor-form-fields";
import type { EditDraftVersionFormState, SaveStatus } from "../hooks/use-edit-draft-version-form";
import type { CaseVersionFormValues } from "../services/case-version-form-schema";
import type { GlossaryVocabularyOptions } from "../hooks/use-glossary-vocabulary";

const NOT_VALID_BANNER_TITLE = "This version does not read back as a case";
const NOT_VALID_BANNER_MESSAGE =
  "You may still correct its title, when to use, subject, fallback and consolidation register below.";

const NO_CONSOLIDATION_REGISTER_TEXT = "This version declares no consolidation register.";

type NotValidPhaseState = Extract<EditDraftVersionFormState, { phase: "not-valid" }>;

export type EnrichedNotValidState = NotValidPhaseState & {
  readonly form: UseFormReturn<CaseVersionFormValues>;
  readonly status: SaveStatus;
  readonly isBlocked: boolean;
  readonly outcomeOptions: GlossaryVocabularyOptions;
  readonly actionOptions: GlossaryVocabularyOptions;
  readonly recipientOptions: GlossaryVocabularyOptions;
  readonly onSubmit: (event?: BaseSyntheticEvent) => void;
  readonly onFieldBlur: () => void;
  readonly onCancel: () => void;
};

export function isEnrichedNotValidState(
  state: NotValidPhaseState,
): state is EnrichedNotValidState {
  return state.form !== undefined;
}

export type CaseVersionEditorNotValidViewProps = {
  readonly state: EnrichedNotValidState;
};

export function CaseVersionEditorNotValidView({
  state,
}: CaseVersionEditorNotValidViewProps): JSX.Element {
  const consolidationRegister = state.form.watch("consolidation_register");

  return (
    <>
      <ConflictBanner title={NOT_VALID_BANNER_TITLE} message={NOT_VALID_BANNER_MESSAGE} />
      <CaseVersionEditorFormFields
        form={state.form}
        savedAt={null}
        isBlocked={state.isBlocked}
        outcomeOptions={state.outcomeOptions}
        actionOptions={state.actionOptions}
        recipientOptions={state.recipientOptions}
        onSubmit={state.onSubmit}
        onFieldBlur={state.onFieldBlur}
      />
      {consolidationRegister == null && <p>{NO_CONSOLIDATION_REGISTER_TEXT}</p>}
      <ButtonFooter>
        <Button
          type="submit"
          form={CASE_VERSION_EDITOR_FORM_ID}
          disabled={state.isBlocked || state.status === "clean"}
        >
          Save changes
        </Button>
        <Button type="button" variant="secondary" onClick={state.onCancel}>
          Cancel
        </Button>
      </ButtonFooter>
    </>
  );
}
