/**
 * The shared Revise/New-hypothesis form's own state
 * (task/manifest-hypothesis-authoring/revise-hypothesis-form): loads the
 * addressed case version's own declared subject type (fixed, never
 * editable, rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft),
 * and -- only when addressing an existing hypothesis (the Revise route,
 * criterion 3) -- that hypothesis's current revision, to pre-populate the
 * form. Filters the Collects field's own offered concepts to those whose
 * `accepts` list includes the draft's subject type (criterion 4), and
 * dispatches POST /v1/cases/{slug}/hypotheses on submit (criterion 9).
 *
 * One hook backs both entry points this task's own rationale splits into
 * two routes: `hypothesisName === null` is the blank New-hypothesis form
 * (criterion 2), and a non-null name is the pre-loaded Revise form
 * (criterion 3) -- both dispatch the exact same mutation, since both submit
 * the same body shape (this task's own rationale: "one reason to change...
 * not two").
 *
 * Business logic lives here rather than inline in the screen's JSX (ARC-03),
 * matching use-edit-draft-version-form.ts's own convention.
 */

import { useEffect, useRef, type BaseSyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import {
  hypothesisRevisionFormSchema,
  type HypothesisRevisionFormValues,
} from "../services/hypothesis-revision-form-schema";
import { useTelemetry } from "./use-telemetry";
import { useConceptOptions, type ConceptOption } from "./use-concept-options";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabularyOptions,
} from "./use-glossary-vocabulary";

/** The one field this hook reads off GET /v1/cases/{slug}/versions/{version} -- the draft's own declared subject type (domain/glossary/subject-type) the concept-acceptance pre-check and the submitted body's own `subject` both anchor against. */
type CaseVersionSubject = {
  readonly subject: string;
};

/** One revision as GET /v1/cases/{slug}/hypotheses/{name}/revisions answers it (src/src/case/case-store.port.ts's own HypothesisRevisionListItem, confirmed directly against that file) -- every attribute this form pre-populates from. */
type HypothesisRevisionListItem = {
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: HypothesisRevisionFormValues["resolution"];
};

type HypothesisRevisionsPage = {
  readonly data: readonly HypothesisRevisionListItem[];
};

/** POST /v1/cases/{slug}/hypotheses's own response (revise-hypothesis.routes.ts: 201 with `{ hypothesis_name, revision }`, never echoing the saved content). */
type RevisedHypothesis = {
  readonly hypothesis_name: string;
  readonly revision: number;
};

export type HypothesisRevisionFormState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<HypothesisRevisionFormValues>;
      /** True on the New-hypothesis route (criterion 2); false on the Revise route, where the hypothesis's own identity is fixed (criterion 3). */
      readonly hypothesisNameEditable: boolean;
      /** The draft's own declared subject type, shown fixed and never editable (criteria 2 and 3). */
      readonly subjectType: string;
      /** Only the concepts whose own `accepts` list includes `subjectType` (criterion 4). */
      readonly collectsOptions: readonly ConceptOption[];
      readonly outcomeOptions: GlossaryVocabularyOptions;
      readonly actionOptions: GlossaryVocabularyOptions;
      readonly recipientOptions: GlossaryVocabularyOptions;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
    }
  | {
      readonly phase: "success";
      readonly hypothesisName: string;
      readonly revision: number;
      readonly onOpenManifestBuilder: () => void;
    };

/** The revision this form pre-populates from: the one GET /v1/cases/{slug}/hypotheses/{name}/revisions's own ascending-by-revision page names with the highest revision number -- "that hypothesis's current revision" (criterion 3). Every hypothesis is guaranteed at least one revision by the domain (rules/knowledge/a-hypothesis-declares-a-criterion's own originating rule); `undefined` here is a defensive fallback this hook treats as a load failure rather than a real, reachable empty state. */
function latestRevisionOf(
  revisions: readonly HypothesisRevisionListItem[],
): HypothesisRevisionListItem | undefined {
  return revisions.reduce<HypothesisRevisionListItem | undefined>(
    (latest, item) => (latest === undefined || item.revision > latest.revision ? item : latest),
    undefined,
  );
}

export function useHypothesisRevisionForm(
  slug: string,
  version: number,
  hypothesisName: string | null,
): HypothesisRevisionFormState {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const isSubmittingRef = useRef(false);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionSubject>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`),
  });

  const revisionsQuery = useQuery({
    queryKey: ["hypothesis-revisions", slug, hypothesisName],
    queryFn: () =>
      apiFetch<HypothesisRevisionsPage>(
        `/v1/cases/${encodeURIComponent(slug)}/hypotheses/${encodeURIComponent(hypothesisName ?? "")}/revisions`,
      ),
    enabled: hypothesisName !== null,
  });

  const conceptOptions = useConceptOptions();
  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

  const form = useForm<HypothesisRevisionFormValues>({
    resolver: zodResolver(hypothesisRevisionFormSchema),
    defaultValues: {
      hypothesis_name: "",
      criterion: "",
      collects: [],
      resolution: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });

  // Pre-populates the form from the addressed hypothesis's current revision
  // (criterion 3), once. `form` is react-hook-form's own stable object
  // across renders, left out of this effect's own dependency array,
  // matching use-edit-draft-version-form.ts's own established convention
  // for the same reason -- only a freshly loaded revision should re-seed
  // the form.
  useEffect(() => {
    if (hypothesisName === null || revisionsQuery.data === undefined) {
      return;
    }
    const latest = latestRevisionOf(revisionsQuery.data.data);
    if (latest === undefined) {
      return;
    }
    form.reset({
      hypothesis_name: hypothesisName,
      criterion: latest.criterion,
      collects: [...latest.collects],
      resolution: latest.resolution,
    });
  }, [hypothesisName, revisionsQuery.data]);

  const reviseMutation = useMutation({
    mutationFn: (values: HypothesisRevisionFormValues) => {
      // `submit` below is only reachable once the "ready" phase is
      // returned, which never happens while versionQuery.data is still
      // absent -- this guard is a type-level narrowing of that structural
      // guarantee, not a path this hook expects to actually take.
      if (versionQuery.data === undefined) {
        throw new Error("cannot submit a hypothesis revision before the draft's subject type has loaded");
      }
      const body = {
        hypothesis_name: values.hypothesis_name,
        criterion: values.criterion,
        collects: values.collects,
        resolution: values.resolution,
        subject: versionQuery.data.subject,
      };
      return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data) => {
      isSubmittingRef.current = false;
      telemetry.hypothesisRevised({
        slug,
        hypothesis_name: data.hypothesis_name,
        revision: data.revision,
        is_new_identity: hypothesisName === null,
      });
      void queryClient.invalidateQueries({
        queryKey: ["hypothesis-revisions", slug, data.hypothesis_name],
      });
    },
    onError: () => {
      isSubmittingRef.current = false;
      // CaseHoldsNoDraftError, HypothesisRevisionCollectsNoConceptError,
      // ConceptNotInGlossaryError and ConceptRefusesSubjectTypeError all
      // collapse to the same generic-error UI state today (error-ui-state.ts,
      // this task's own inventory) -- one shared generic failure message for
      // any of them, never a per-concept highlight (criterion 11, this
      // task's own Notes: "all four currently collapse to an
      // indistinguishable 500"). Mirrors use-edit-draft-version-form.ts's own
      // generic, non-domain fallback message rather than inventing a second
      // one.
      toast.error("Something went wrong while saving. Try again.");
    },
  });

  const isLoadingGlossary =
    conceptOptions.isLoading ||
    outcomeOptions.isLoading ||
    actionOptions.isLoading ||
    recipientOptions.isLoading;
  const isGlossaryError =
    conceptOptions.isError || outcomeOptions.isError || actionOptions.isError || recipientOptions.isError;
  const isRevisionsPending = hypothesisName !== null && (revisionsQuery.isLoading || !revisionsQuery.data);
  const isRevisionsError = hypothesisName !== null && revisionsQuery.isError;

  if (reviseMutation.isSuccess && reviseMutation.data) {
    const { hypothesis_name: revisedHypothesisName, revision } = reviseMutation.data;
    return {
      phase: "success",
      hypothesisName: revisedHypothesisName,
      revision,
      onOpenManifestBuilder: () => {
        void navigate({
          to: "/cases/$slug/versions/$version/manifest",
          params: { slug, version: String(version) },
        });
      },
    };
  }

  if (versionQuery.isError || isGlossaryError || isRevisionsError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void versionQuery.refetch();
        if (hypothesisName !== null) {
          void revisionsQuery.refetch();
        }
        conceptOptions.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
      },
    };
  }

  if (versionQuery.isLoading || !versionQuery.data || isLoadingGlossary || isRevisionsPending) {
    return { phase: "loading" };
  }

  // Read into a local binding rather than repeating `versionQuery.data.subject`:
  // TypeScript's narrowing of a property access above (`!versionQuery.data`)
  // does not reliably survive into the closure `.filter()` passes below, so
  // this binding is what actually carries the non-undefined type across it.
  const subjectType = versionQuery.data.subject;
  const availableConcepts = conceptOptions.concepts.filter((concept) =>
    concept.accepts.includes(subjectType),
  );

  // isSubmittingRef guards the same double-submit race
  // use-edit-draft-version-form.ts's own header comment describes (a blur
  // and a button click reaching this callback from one physical action
  // before either call's own state update has committed a re-render) --
  // `submit` itself is exposed as `onSubmit` directly, unwrapped, so its own
  // `(event?: BaseSyntheticEvent) => Promise<void>` signature keeps calling
  // `event.preventDefault()` internally exactly as react-hook-form's
  // handleSubmit already does; wrapping it in a second arrow function that
  // discards the event would drop that call and let the browser's own
  // default form submission (a full page reload) run alongside it.
  const submit = form.handleSubmit((values) => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    reviseMutation.mutate(values);
  });

  return {
    phase: "ready",
    form,
    hypothesisNameEditable: hypothesisName === null,
    subjectType,
    collectsOptions: availableConcepts,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    isSubmitting: reviseMutation.isPending,
    onSubmit: submit,
  };
}
