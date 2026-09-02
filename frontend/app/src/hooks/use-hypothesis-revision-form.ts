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

type CaseVersionSubject = {
  readonly subject: string;
};

type HypothesisRevisionListItem = {
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: HypothesisRevisionFormValues["resolution"];
};

type HypothesisRevisionsPage = {
  readonly data: readonly HypothesisRevisionListItem[];
};

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

      readonly hypothesisNameEditable: boolean;

      readonly subjectType: string;

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

export function latestRevisionOf<T extends { readonly revision: number }>(
  revisions: readonly T[],
): T | undefined {
  return revisions.reduce<T | undefined>(
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

  const subjectType = versionQuery.data.subject;
  const availableConcepts = conceptOptions.concepts.filter((concept) =>
    concept.accepts.includes(subjectType),
  );

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
