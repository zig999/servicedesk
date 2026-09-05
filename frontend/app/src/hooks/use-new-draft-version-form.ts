import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useCaseVersions, type CaseVersionsPage } from "./use-case-versions";
import {
  errorStateKind,
  resetFormFrom,
  useEditDraftVersionForm,
  type CaseVersionRecord,
  type EditDraftVersionFormState,
} from "./use-edit-draft-version-form";

type CreateDraftRequestBody = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
  readonly consolidation_register?: CaseVersionFormValues["consolidation_register"];
  readonly source_version?: number;
};

type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

export function useNewDraftVersionForm(slug: string): EditDraftVersionFormState {
  const navigate = useNavigate();
  const telemetry = useTelemetry();
  const isSubmittingRef = useRef(false);
  const [created, setCreated] = useState<{ readonly version: number } | null>(null);

  const subjectOptions = useGlossaryVocabularyOptions("subject-type");
  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

  const versionsQuery = useCaseVersions(slug);
  const latestReleasedVersionNumber = versionsQuery.data?.data
    .filter((item) => item.state === "released")
    .reduce<number | undefined>(
      (latest, item) => (latest === undefined || item.version > latest ? item.version : latest),
      undefined,
    );
  const hasLoadedVersions = versionsQuery.data !== undefined;

  const sourceVersionQuery = useQuery({
    queryKey: ["case-version", slug, latestReleasedVersionNumber ?? null],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${latestReleasedVersionNumber}`,
      ),
    enabled: latestReleasedVersionNumber !== undefined,
  });

  const createForm = useForm<CaseVersionFormValues>({
    resolver: zodResolver(caseVersionFormSchema),
    defaultValues: {
      title: "",
      when_to_use: "",
      subject: "",
      fallback: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });

  const subjectValue = subjectOptions.options[0]?.value;
  useEffect(() => {
    if (
      subjectValue !== undefined &&
      hasLoadedVersions &&
      latestReleasedVersionNumber === undefined
    ) {
      createForm.setValue("subject", subjectValue);
    }
  }, [subjectValue, hasLoadedVersions, latestReleasedVersionNumber]);

  useEffect(() => {
    if (sourceVersionQuery.data) {
      resetFormFrom(createForm, sourceVersionQuery.data);
    }
  }, [sourceVersionQuery.data]);

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

        ...(latestReleasedVersionNumber !== undefined
          ? {
              consolidation_register: values.consolidation_register,
              source_version: latestReleasedVersionNumber,
            }
          : {}),
      };
      return apiFetch<CreatedDraft>("/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data) => {

      isSubmittingRef.current = false;
      telemetry.caseDraftCreated({ slug, version: data.version });
      setCreated({ version: data.version });
    },
    onError: (error) => {
      isSubmittingRef.current = false;
      const kind = errorStateKind(error);
      if (kind === "case-already-has-draft") {
        toast.error(`A draft already exists for the case "${slug}".`);
        void redirectToExistingDraft();
        return;
      }

      toast.error("Something went wrong while saving. Try again.");
    },
  });

  const editState = useEditDraftVersionForm(slug, created?.version ?? null);

  if (created) {
    return editState;
  }

  const isLoadingVersionSource =
    versionsQuery.isLoading ||
    (latestReleasedVersionNumber !== undefined && sourceVersionQuery.data === undefined);
  const isVersionSourceError =
    versionsQuery.isError || (latestReleasedVersionNumber !== undefined && sourceVersionQuery.isError);

  const isLoadingGlossary =
    subjectOptions.isLoading ||
    outcomeOptions.isLoading ||
    actionOptions.isLoading ||
    recipientOptions.isLoading ||
    isLoadingVersionSource;
  const isGlossaryError =
    subjectOptions.isError ||
    outcomeOptions.isError ||
    actionOptions.isError ||
    recipientOptions.isError ||
    isVersionSourceError;

  if (isGlossaryError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        subjectOptions.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
        void versionsQuery.refetch();
        if (latestReleasedVersionNumber !== undefined) {
          void sourceVersionQuery.refetch();
        }
      },
    };
  }
  if (isLoadingGlossary) {
    return { phase: "loading" };
  }

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

    onFieldBlur: () => {
      // Deliberately no-op; see this property's own comment above.
    },

    isFirstVersion: latestReleasedVersionNumber === undefined,
  };
}
