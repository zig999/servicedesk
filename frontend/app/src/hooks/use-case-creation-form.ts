import { useRef, type BaseSyntheticEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import {
  caseCreationFormSchema,
  stillAbsentRequiredFields,
  type CaseCreationFormValues,
} from "../services/case-creation-form-schema";
import { useGlossaryVocabularyOptions, type GlossaryVocabularyOptions } from "./use-glossary-vocabulary";

export type CaseCreationFormState =
  | { readonly phase: "loading"; readonly onCancel: () => void }
  | {
      readonly phase: "load-error";
      readonly retryLoad: () => void;
      readonly onCancel: () => void;
    }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<CaseCreationFormValues>;
      readonly outcomeOptions: GlossaryVocabularyOptions;
      readonly actionOptions: GlossaryVocabularyOptions;
      readonly recipientOptions: GlossaryVocabularyOptions;
      readonly stillAbsentFields: readonly string[];
      readonly isSubmitting: boolean;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
      readonly onCancel: () => void;
    };

const CREATE_FAILURE_MESSAGE_BY_KIND: Partial<Record<UiErrorStateKind, string>> = {
  "case-already-has-draft":
    "This case already has a draft in progress; open that case to continue it instead.",
};

const GENERIC_CREATE_FAILURE_MESSAGE = "Something went wrong while creating this case. Try again.";

function createFailureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const state = uiStateForApiError(error);
    return CREATE_FAILURE_MESSAGE_BY_KIND[state.kind] ?? GENERIC_CREATE_FAILURE_MESSAGE;
  }
  return GENERIC_CREATE_FAILURE_MESSAGE;
}

type CreateDraftRequestBody = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: CaseCreationFormValues["fallback"];
  readonly consolidation_register?: CaseCreationFormValues["consolidation_register"];
};

type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

export function useCaseCreationForm(): CaseCreationFormState {
  const navigate = useNavigate();
  const router = useRouter();
  const isDispatchingRef = useRef(false);

  const onCancel = (): void => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void navigate({ to: "/cases" });
  };

  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

  const form = useForm<CaseCreationFormValues>({
    resolver: zodResolver(caseCreationFormSchema),
    defaultValues: {
      slug: "",
      title: "",
      when_to_use: "",
      subject: "",
      fallback: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const stillAbsentFields = stillAbsentRequiredFields(watchedValues);

  const mutation = useMutation({
    mutationFn: (values: CaseCreationFormValues) => {
      const body: CreateDraftRequestBody = {
        slug: values.slug,
        authored_at: new Date().toISOString(),
        title: values.title,
        when_to_use: values.when_to_use,
        subject: values.subject,
        fallback: values.fallback,
        ...(values.consolidation_register !== undefined
          ? { consolidation_register: values.consolidation_register }
          : {}),
      };
      return apiFetch<CreatedDraft>("/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data) => {
      void navigate({
        to: "/cases/$slug/versions/$version",
        params: { slug: data.slug, version: String(data.version) },
      });
    },
    onError: (error) => {
      toast.error(createFailureMessage(error));
    },
  });

  if (outcomeOptions.isError || actionOptions.isError || recipientOptions.isError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
      },
      onCancel,
    };
  }
  if (outcomeOptions.isLoading || actionOptions.isLoading || recipientOptions.isLoading) {
    return { phase: "loading", onCancel };
  }

  const submit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const onSubmit = (event?: BaseSyntheticEvent): void => {
    if (isDispatchingRef.current) {
      event?.preventDefault();
      return;
    }
    isDispatchingRef.current = true;
    void submit(event).finally(() => {
      isDispatchingRef.current = false;
    });
  };

  return {
    phase: "ready",
    form,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    stillAbsentFields: stillAbsentFields.map((field) => field.label),
    isSubmitting: mutation.isPending,
    onSubmit,
    onCancel,
  };
}
