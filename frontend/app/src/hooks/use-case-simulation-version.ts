/**
 * Loads the one case version the Simulation Cockpit route
 * (route-tree.tsx's own "/cases/$slug/versions/$version/simulate",
 * task/simulation-cockpit/case-simulation-route) is addressed at, through the
 * same GET /v1/cases/{slug}/versions/{version} read (contracts/knowledge/
 * case-query) every other reader of one version already issues.
 *
 * Deliberately reuses the exact ["case-version", slug, version] query key
 * use-edit-draft-version-form.ts and use-case-attributes-at-a-glance.ts both
 * already key their own read of the same endpoint by (STA-01: server data is
 * read from the cache, never copied into a second store) -- a curator
 * navigating from the Version Editor or Case Detail into Simulate for the
 * exact same version reuses whatever that earlier screen already cached
 * instead of re-fetching it.
 *
 * A phase-union hook (loading | load-error | ready), following the
 * screen/ready-view/hooks triad convention every other routed detail screen
 * in this area already follows (inventory's own convention entry,
 * case-version-editor-screen.tsx). This task's own objective is the route and
 * its header only, so this hook exposes just what the header needs -- the
 * loaded record (for its `when_to_use`) and the version's own state
 * (domain/knowledge/case-version-state) for the state pill and the
 * "Edit version" link's own draft/released branch. It carries no
 * case-not-found navigate-away branch the way use-edit-draft-version-form.ts
 * does: no criterion of this task asks for it, and a generic load-error with
 * a retry action (EDG-02) already covers every failure this hook can see,
 * including a 404.
 */

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";
import type { CaseVersionState } from "./use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseSimulationVersionState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly record: CaseVersionRecord;
      readonly versionState: CaseVersionState;
    };

export function useCaseSimulationVersion(
  slug: string,
  version: number,
): CaseSimulationVersionState {
  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,
      ),
  });

  if (versionQuery.isError) {
    return { phase: "load-error", retryLoad: () => void versionQuery.refetch() };
  }
  if (versionQuery.isLoading || !versionQuery.data) {
    return { phase: "loading" };
  }

  const record = versionQuery.data;
  if (record.state === undefined) {
    // Structurally unreachable: a real GET .../versions/{version} always
    // reports domain/knowledge/case-version-state's own required attribute
    // (case-version-record.ts's own header comment) -- `state` is optional
    // on CaseVersionRecord only for use-new-draft-version-form.ts's own
    // seed literal, which this hook never supplies. This guard exists only
    // so `versionState` below can be read without a type assertion (TYP-02).
    throw new Error("a loaded case version record always reports its own state");
  }

  return { phase: "ready", record, versionState: record.state };
}
