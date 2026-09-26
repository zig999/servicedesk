import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteCase } from "./use-delete-case";
import {
  buildCaseDeleteControlState,
  caseDeleteFailureMessage,
  type CaseDeleteControlState,
} from "../services/case-delete-confirmation";

export function useCaseDeleteControl(slug: string): CaseDeleteControlState {
  const navigate = useNavigate();
  const deleteCase = useDeleteCase();
  const [isOpen, setIsOpen] = useState(false);
  const [slugConfirmation, setSlugConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return buildCaseDeleteControlState({
    slug,
    dialogOpen: [isOpen, setIsOpen],
    slugConfirmation: [slugConfirmation, setSlugConfirmation],
    errorMessage: [errorMessage, setErrorMessage],
    isDeleting: deleteCase.isPending,
    onConfirm: () => {
      deleteCase.mutate(slug, {
        onSuccess: () => {
          void navigate({ to: "/cases" });
        },
        onError: (error) => {
          setErrorMessage(caseDeleteFailureMessage(error, slug));
        },
      });
    },
  });
}
