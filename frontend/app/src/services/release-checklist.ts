import { ApiError } from "./api-client";
import type { CaseVersionManifestEntry } from "./case-version-record";
import type { ManifestPinnedRevisionStates } from "../hooks/use-manifest-pinned-revision-states";

export type ReleaseConditionStatus = "met" | "unmet" | "undecided";

export type ReleaseCondition = {
  readonly label: string;
  readonly status: ReleaseConditionStatus;
};

export type ReleaseControlState = {
  readonly version: number;

  readonly canRelease: boolean;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;

  readonly conditions: readonly ReleaseCondition[];
  readonly violations: readonly string[] | null;

  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

export const MANIFEST_PIN_RELEASE_CONDITION_LABEL =
  "Every manifest entry references a released hypothesis revision";

export function manifestPinReleaseCondition(
  manifest: readonly CaseVersionManifestEntry[],
  pinnedStates: ManifestPinnedRevisionStates,
): ReleaseCondition {
  let hasUnreleasedEntry = false;
  let hasUnreadEntry = false;

  for (const entry of manifest) {
    const pinned = pinnedStates.get(entry.position);
    if (pinned === undefined || pinned.status !== "resolved") {
      hasUnreadEntry = true;
      continue;
    }
    if (pinned.state !== "released") {
      hasUnreleasedEntry = true;
    }
  }

  const status: ReleaseConditionStatus = hasUnreleasedEntry
    ? "unmet"
    : hasUnreadEntry
      ? "undecided"
      : "met";

  return { label: MANIFEST_PIN_RELEASE_CONDITION_LABEL, status };
}

export function extractReleaseViolations(error: unknown): readonly string[] {
  if (!(error instanceof ApiError)) {
    return [];
  }
  const { details } = error;
  if (typeof details !== "object" || details === null || !("violations" in details)) {
    return [];
  }
  const { violations } = details;
  return Array.isArray(violations)
    ? violations.filter((item): item is string => typeof item === "string")
    : [];
}
