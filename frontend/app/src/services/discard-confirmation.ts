import type { UseMutationOptions } from "@tanstack/react-query";
import { apiFetch, ApiError } from "./api-client";

export type DiscardControlState = {
  readonly version: number;

  readonly canDiscard: boolean;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;

  readonly slugConfirmation: string;
  readonly onSlugConfirmationChange: (value: string) => void;

  readonly isConfirmEnabled: boolean;

  readonly errorMessage: string | null;
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

export function isSlugConfirmed(typedSlug: string, slug: string): boolean {
  return typedSlug === slug;
}

export function discardErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof ApiError ? error.message : fallbackMessage;
}

const GENERIC_DISCARD_FAILURE_MESSAGE = "Something went wrong while discarding this draft. Try again.";

export function buildDiscardMutationOptions(params: {
  readonly slug: string;
  readonly version: number | null;
  readonly onDiscarded: (version: number) => void;
  readonly onFailed: (message: string) => void;
}): UseMutationOptions<number, unknown, void> {
  const { slug, version, onDiscarded, onFailed } = params;
  return {
    mutationFn: async () => {
      if (version === null) {
        throw new Error("cannot discard a draft version that has not been created yet");
      }
      await apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`, {
        method: "DELETE",
      });
      return version;
    },
    onSuccess: onDiscarded,
    onError: (error) => onFailed(discardErrorMessage(error, GENERIC_DISCARD_FAILURE_MESSAGE)),
  };
}

export function buildDiscardControlState(params: {
  readonly version: number;
  readonly slug: string;
  readonly canDiscard: boolean;
  readonly dialogOpen: readonly [boolean, (open: boolean) => void];
  readonly slugConfirmation: readonly [string, (value: string) => void];
  readonly errorMessage: readonly [string | null, (message: string | null) => void];
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
}): DiscardControlState {
  const { version, canDiscard, slug, isConfirming, onConfirm } = params;
  const [isOpen, setIsOpen] = params.dialogOpen;
  const [slugConfirmation, setSlugConfirmation] = params.slugConfirmation;
  const [errorMessage, setErrorMessage] = params.errorMessage;
  return {
    version,
    canDiscard,
    isOpen,
    onOpenChange: (open: boolean) => {
      setIsOpen(open);
      setSlugConfirmation("");
      setErrorMessage(null);
    },
    slugConfirmation,
    onSlugConfirmationChange: setSlugConfirmation,
    isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug),
    errorMessage,
    isConfirming,
    onConfirm,
  };
}
