import { useEffect, useRef, type BaseSyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import {
  hypothesisRevisionFormSchema,
  type HypothesisRevisionFormValues,
} from "../services/hypothesis-revision-form-schema";
import { errorStateKind } from "./use-edit-draft-version-form";
import { useTelemetry } from "./use-telemetry";
import { useConceptOptions, type ConceptOption } from "./use-concept-options";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabularyOptions,
} from "./use-glossary-vocabulary";

type ManifestEntryDto = {
  readonly hypothesis_revision: {
    readonly hypothesis: { readonly name: string };
    readonly revision: number;
  };
};

type CaseVersionSubject = {
  readonly subject: string;
  readonly manifest: readonly ManifestEntryDto[];
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

const UNREAD_DRAFT_SUBJECT = "unread-draft-subject";

export type HypothesisRevisionFormState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<HypothesisRevisionFormValues>;

      readonly hypothesisNameEditable: boolean;

      readonly subjectType: string | null;

      readonly caseVersionNotValid: boolean;

      readonly pinnedRevision: number | null;

      readonly collectsOptions: readonly ConceptOption[];
      readonly outcomeOptions: GlossaryVocabularyOptions;
      readonly actionOptions: GlossaryVocabularyOptions;
      readonly recipientOptions: GlossaryVocabularyOptions;
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;

      readonly onOpenManifest: () => void;
      readonly onCancel: () => void;
    }
  | {
      readonly phase: "success";
      readonly hypothesisName: string;
      readonly revision: number;

      readonly offerManifestBuilder: boolean;
      readonly onOpenManifestBuilder: () => void;
    };

function pinnedRevisionFor(
  manifest: readonly ManifestEntryDto[],
  hypothesisName: string | null,
): number | null {
  if (hypothesisName === null) {
    return null;
  }
  const entry = manifest.find(
    (item) => item.hypothesis_revision.hypothesis.name === hypothesisName,
  );
  return entry === undefined ? null : entry.hypothesis_revision.revision;
}

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const isSubmittingRef = useRef(false);
  const pinnedRevisionBeforeSaveRef = useRef<number | null>(null);

  const openManifest = (): void => {
    void navigate({
      to: "/cases/$slug/versions/$version/manifest",
      params: { slug, version: String(version) },
    });
  };

  const cancelComposition = (): void => {
    router.history.back();
  };

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

  const versionErrorKind = errorStateKind(versionQuery.error);
  const isVersionNotValid = versionQuery.isError && versionErrorKind === "case-not-valid";
  const versionData = isVersionNotValid ? undefined : versionQuery.data;

  const reviseMutation = useMutation({
    mutationFn: (values: HypothesisRevisionFormValues) => {

      const body = {
        hypothesis_name: values.hypothesis_name,
        criterion: values.criterion,
        collects: values.collects,
        resolution: values.resolution,
        subject: versionData === undefined ? UNREAD_DRAFT_SUBJECT : versionData.subject,
      };
      return apiFetch<RevisedHypothesis>(`/v1/cases/${encodeURIComponent(slug)}/hypotheses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onMutate: () => {
      pinnedRevisionBeforeSaveRef.current =
        versionData === undefined
          ? null
          : pinnedRevisionFor(versionData.manifest, hypothesisName);
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
    const pinnedBeforeSave = pinnedRevisionBeforeSaveRef.current;
    return {
      phase: "success",
      hypothesisName: revisedHypothesisName,
      revision,
      offerManifestBuilder: pinnedBeforeSave === null || revision > pinnedBeforeSave,
      onOpenManifestBuilder: openManifest,
    };
  }

  if (isGlossaryError || isRevisionsError || (versionQuery.isError && !isVersionNotValid)) {
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

  if (
    versionQuery.isLoading ||
    (!versionQuery.data && !isVersionNotValid) ||
    isLoadingGlossary ||
    isRevisionsPending
  ) {
    return { phase: "loading" };
  }

  const subjectType = versionData === undefined ? null : versionData.subject;
  const availableConcepts =
    subjectType === null
      ? conceptOptions.concepts
      : conceptOptions.concepts.filter((concept) => concept.accepts.includes(subjectType));

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
    caseVersionNotValid: isVersionNotValid,
    pinnedRevision:
      versionData === undefined ? null : pinnedRevisionFor(versionData.manifest, hypothesisName),
    collectsOptions: availableConcepts,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    isSubmitting: reviseMutation.isPending,
    onSubmit: submit,
    onOpenManifest: openManifest,
    onCancel: cancelComposition,
  };
}
