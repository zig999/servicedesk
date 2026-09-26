import { isSlugConfirmed } from "./discard-confirmation";

export type CaseDeleteControlState = {
  readonly slug: string;

  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;

  readonly slugConfirmation: string;
  readonly onSlugConfirmationChange: (value: string) => void;

  readonly isConfirmEnabled: boolean;

  readonly isDeleting: boolean;
  readonly onConfirm: () => void;
};

export function buildCaseDeleteControlState(params: {
  readonly slug: string;
  readonly dialogOpen: readonly [boolean, (open: boolean) => void];
  readonly slugConfirmation: readonly [string, (value: string) => void];
  readonly isDeleting: boolean;
  readonly onConfirm: () => void;
}): CaseDeleteControlState {
  const { slug, isDeleting, onConfirm } = params;
  const [isOpen, setIsOpen] = params.dialogOpen;
  const [slugConfirmation, setSlugConfirmation] = params.slugConfirmation;
  return {
    slug,
    isOpen,
    onOpenChange: (open: boolean) => {
      setIsOpen(open);
      setSlugConfirmation("");
    },
    slugConfirmation,
    onSlugConfirmationChange: setSlugConfirmation,
    isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug),
    isDeleting,
    onConfirm,
  };
}
