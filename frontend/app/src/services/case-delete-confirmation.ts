import { ApiError } from "./api-client";
import { isSlugConfirmed } from "./discard-confirmation";
import { uiStateForApiError } from "./error-ui-state";

export type CaseDeleteControlState = {
  readonly slug: string;

  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;

  readonly slugConfirmation: string;
  readonly onSlugConfirmationChange: (value: string) => void;

  readonly isConfirmEnabled: boolean;

  readonly errorMessage: string | null;
  readonly isDeleting: boolean;
  readonly onConfirm: () => void;
};

const CASE_HOLDS_VERSIONS_MESSAGE =
  "This case was not deleted: it still holds at least one version.";
const UNRECOGNISED_DELETE_FAILURE_MESSAGE =
  "This delete failed for a reason this screen doesn't recognise.";

function caseNotFoundMessage(slug: string): string {
  return `This case was not deleted: no case answers ${slug}.`;
}

export function caseDeleteFailureMessage(error: unknown, slug: string): string {
  if (error instanceof ApiError) {
    const kind = uiStateForApiError(error).kind;
    if (kind === "case-holds-versions") {
      return CASE_HOLDS_VERSIONS_MESSAGE;
    }
    if (kind === "case-not-found") {
      return caseNotFoundMessage(slug);
    }
  }
  return UNRECOGNISED_DELETE_FAILURE_MESSAGE;
}

export function buildCaseDeleteControlState(params: {
  readonly slug: string;
  readonly dialogOpen: readonly [boolean, (open: boolean) => void];
  readonly slugConfirmation: readonly [string, (value: string) => void];
  readonly errorMessage: readonly [string | null, (message: string | null) => void];
  readonly isDeleting: boolean;
  readonly onConfirm: () => void;
}): CaseDeleteControlState {
  const { slug, isDeleting, onConfirm } = params;
  const [isOpen, setIsOpen] = params.dialogOpen;
  const [slugConfirmation, setSlugConfirmation] = params.slugConfirmation;
  const [errorMessage, setErrorMessage] = params.errorMessage;
  return {
    slug,
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
    isDeleting,
    onConfirm,
  };
}
