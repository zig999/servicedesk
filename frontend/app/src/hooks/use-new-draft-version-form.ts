/**
 * The New Draft origination flow's own state (task/version-editor/
 * new-draft-creation): a blank instance of the Version Editor's shared field
 * form (task/version-editor/edit-draft-version), pre-set only with the one
 * subject-type value GET /v1/glossary/subject-type currently returns
 * (criterion 2), whose first Save dispatches POST /v1/cases rather than
 * PATCH (criterion 3).
 *
 * A 201 response switches the form into the exact same edit-mode flow
 * useEditDraftVersionForm delivers for an existing draft, addressed by the
 * version number the response returns (criterion 4), seeded from the
 * content just submitted rather than a follow-up GET (criterion 5) --
 * POST /v1/cases's own response carries only `{ slug, version }`
 * (src/src/case/create-draft.operation.ts's own CreatedDraft), never the
 * content, so there is nothing else to seed it from and nothing a GET would
 * add that this hook does not already hold. `useEditDraftVersionForm` is
 * called unconditionally (Rules of Hooks) with `version` staying `null`
 * until that switch happens; its own widened signature (see that hook's own
 * header comment) is exactly what makes this delegation possible without
 * ever issuing the GET it would otherwise perform.
 *
 * A 409 CaseAlreadyHasDraftError shows a toast stating a draft already
 * exists for the case and navigates to that case's existing draft version,
 * resolved by reading GET /v1/cases/{slug}/versions (criterion 6) -- the
 * same list-case-versions read case-detail-timeline already uses to find a
 * draft, read again here rather than assumed cached, since this screen never
 * loaded that list itself.
 *
 * Deliberately never calls `navigate()` to the general "/cases/$slug/
 * versions/$version" route after a successful create, even though
 * intake/onda-3-scope.md's own prose describes the outcome as "navega para a
 * versão recém-criada": doing so would leave the browser addressable at that
 * route, and a refresh there re-mounts CaseVersionEditorScreen, which always
 * issues the very GET this hook exists to avoid -- landing on a version
 * whose manifest is still empty, which read-case.dto.ts's own
 * `manifest.min(1)` constraint cannot describe (this task's own Notes). The
 * form stays addressable at "/cases/$slug/versions/new" instead, using the
 * created version number only to parametrize the PATCH this same hook now
 * dispatches -- criterion 4's "addressed by the version number" is read as a
 * fact about which resource Save now updates, not about the browser's own
 * location. Disclosed as this task's own inference.
 *
 * Business logic lives here rather than inline in the screen's JSX (ARC-03),
 * matching use-edit-draft-version-form.ts's own convention.
 */

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import {
  caseVersionFormSchema,
  type CaseVersionFormValues,
} from "../services/case-version-form-schema";
import { useTelemetry } from "./use-telemetry";
import { useGlossaryVocabularyOptions } from "./use-glossary-vocabulary";
import {
  errorStateKind,
  useEditDraftVersionForm,
  type CaseVersionRecord,
  type EditDraftVersionFormState,
} from "./use-edit-draft-version-form";

/** POST /v1/cases's own request body (createDraftBodySchema, src/src/http/dto/create-draft.dto.ts) -- this task's own criterion 3 names exactly this field set, deliberately omitting consolidation_register (see this task's own Notes) and source_version (this task never copies a manifest). */
type CreateDraftRequestBody = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
};

/** POST /v1/cases's own response -- confirmed against src/src/case/create-draft.operation.ts's own CreatedDraft: the identity a curator now edits, nothing else. */
type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

/** The subset of GET /v1/cases/:slug/versions's own list item this hook reads to resolve the 409 race -- matching case-detail-screen.tsx's own CaseVersionListItem shape (MNT-03 kept in spirit; not imported directly since that module declares it unexported and scoped to its own screen). */
type CaseVersionListItem = {
  readonly version: number;
  readonly state: "draft" | "released";
};

type CaseVersionsPage = {
  readonly data: readonly CaseVersionListItem[];
};

/**
 * Originates a new draft for the named case. Returns the exact same
 * EditDraftVersionFormState shape useEditDraftVersionForm returns, so the
 * screen composing this hook renders through the identical
 * CaseVersionEditorFormFields / conflict-banner markup edit-draft-version
 * already delivers, whichever of the two phases (creating, or already
 * switched into edit mode) is current.
 */
export function useNewDraftVersionForm(slug: string): EditDraftVersionFormState {
  const navigate = useNavigate();
  const telemetry = useTelemetry();
  const isSubmittingRef = useRef(false);
  const [created, setCreated] = useState<{
    readonly version: number;
    readonly record: CaseVersionRecord;
  } | null>(null);

  const subjectOptions = useGlossaryVocabularyOptions("subject-type");
  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

  const createForm = useForm<CaseVersionFormValues>({
    resolver: zodResolver(caseVersionFormSchema),
    defaultValues: {
      title: "",
      when_to_use: "",
      subject: "",
      fallback: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });

  // Pre-sets the subject field to the one subject-type value GET
  // /v1/glossary/subject-type currently returns (criterion 2), once that
  // vocabulary loads. Depends on the resolved value itself, a primitive,
  // rather than `subjectOptions.options` (a fresh array/object literal on
  // every render of useGlossaryVocabularyOptions) -- keying this effect on
  // that array would re-run it, and re-assign the same value, on every
  // unrelated re-render of this hook (every keystroke into another field),
  // rather than only when the vocabulary's own value actually changes.
  // `createForm` is react-hook-form's own stable object across renders (its
  // identity never changes), left out of this effect's own dependency array,
  // matching useEditDraftVersionForm's own established convention for the
  // same reason.
  const subjectValue = subjectOptions.options[0]?.value;
  useEffect(() => {
    if (subjectValue !== undefined) {
      createForm.setValue("subject", subjectValue);
    }
  }, [subjectValue]);

  // Resolves the 409 race (criterion 6): reads the case's own version list
  // and navigates to whichever version that list names as the existing
  // draft. The toast already told the curator a draft exists; a failure to
  // resolve which one, or a case whose draft has since been discarded
  // between the 409 and this read, leaves the curator on this screen rather
  // than navigating somewhere no criterion of this task names.
  async function redirectToExistingDraft(): Promise<void> {
    try {
      const page = await apiFetch<CaseVersionsPage>(
        `/v1/cases/${encodeURIComponent(slug)}/versions`,
      );
      const existingDraft = page.data.find((item) => item.state === "draft");
      if (existingDraft) {
        void navigate({
          to: "/cases/$slug/versions/$version",
          params: { slug, version: String(existingDraft.version) },
        });
      }
    } catch {
      // Nothing further to tell the curator beyond the toast already shown;
      // see this function's own header comment.
    }
  }

  const createMutation = useMutation({
    mutationFn: (values: CaseVersionFormValues) => {
      const body: CreateDraftRequestBody = {
        slug,
        authored_at: new Date().toISOString(),
        title: values.title,
        when_to_use: values.when_to_use,
        subject: values.subject,
        fallback: values.fallback,
      };
      return apiFetch<CreatedDraft>("/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data, values) => {
      // Seeds the switch to edit mode from the content just submitted and
      // the returned version number, never a follow-up GET (criterion 5).
      isSubmittingRef.current = false;
      telemetry.caseDraftCreated({ slug, version: data.version });
      setCreated({
        version: data.version,
        record: {
          title: values.title,
          when_to_use: values.when_to_use,
          subject: values.subject,
          fallback: values.fallback,
        },
      });
    },
    onError: (error) => {
      isSubmittingRef.current = false;
      const kind = errorStateKind(error);
      if (kind === "case-already-has-draft") {
        toast.error(`A draft already exists for the case "${slug}".`);
        void redirectToExistingDraft();
        return;
      }
      // Any other failure (network, an unmapped 5xx): no criterion of this
      // task names wording for this case, only that *something* tells the
      // curator the save did not happen -- mirrors
      // useEditDraftVersionForm's own generic, non-domain fallback message
      // rather than inventing a second one.
      toast.error("Something went wrong while saving. Try again.");
    },
  });

  // Delegates entirely to the edit-mode hook once a draft exists
  // (criterion 4) -- called unconditionally (Rules of Hooks) with `version`
  // staying `null`, and no `seedRecord`, until `created` is set; from then
  // on this hook's own return value is exactly whatever that call returns.
  const editState = useEditDraftVersionForm(slug, created?.version ?? null, created?.record);

  if (created) {
    return editState;
  }

  const isLoadingGlossary =
    subjectOptions.isLoading ||
    outcomeOptions.isLoading ||
    actionOptions.isLoading ||
    recipientOptions.isLoading;
  const isGlossaryError =
    subjectOptions.isError ||
    outcomeOptions.isError ||
    actionOptions.isError ||
    recipientOptions.isError;

  if (isGlossaryError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        subjectOptions.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
      },
    };
  }
  if (isLoadingGlossary) {
    return { phase: "loading" };
  }

  // The blank form is savable from the moment it renders (criterion 3 names
  // only "clicking Save issues POST", not a prior edit) -- unlike
  // useEditDraftVersionForm's own clean/dirty distinction (nothing to
  // compare a first save against), so Save stays enabled throughout except
  // while the POST is in flight.
  const submit = createForm.handleSubmit((values) => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    createMutation.mutate(values);
  });

  return {
    phase: "ready",
    form: createForm,
    status: createMutation.isPending ? "saving" : "dirty",
    savedAt: null,
    isBlocked: createMutation.isPending,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    onSubmit: submit,
    // No criterion of this task asks for a blur-triggered auto-save on the
    // blank form (unlike edit-draft-version's own onFieldBlur, which saves
    // an existing draft's own correction) -- this is a no-op so the shared
    // field markup's own onBlur wiring has something to call.
    onFieldBlur: () => {
      // Deliberately no-op; see this property's own comment above.
    },
  };
}
