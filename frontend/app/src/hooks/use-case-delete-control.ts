import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteCase } from "./use-delete-case";
import {
  buildCaseDeleteControlState,
  type CaseDeleteControlState,
} from "../services/case-delete-confirmation";

export function useCaseDeleteControl(slug: string): CaseDeleteControlState {
  const navigate = useNavigate();
  const deleteCase = useDeleteCase();
  const [isOpen, setIsOpen] = useState(false);
  const [slugConfirmation, setSlugConfirmation] = useState("");

  return buildCaseDeleteControlState({
    slug,
    dialogOpen: [isOpen, setIsOpen],
    slugConfirmation: [slugConfirmation, setSlugConfirmation],
    isDeleting: deleteCase.isPending,
    onConfirm: () => {
      deleteCase.mutate(slug, {
        onSuccess: () => {
          void navigate({ to: "/cases" });
        },
      });
    },
  });
}
