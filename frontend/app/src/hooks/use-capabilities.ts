/**
 * Reads every capability the registry currently holds through the published
 * contracts/integration/capability-registry's own list-capabilities
 * operation (GET /v1/capabilities), task/glossary-and-capabilities-browser/
 * capabilities-browser-screen.
 *
 * domain/integration/capability declares eight fields (name, version,
 * nature, input_schema, output_schema, timeout, connector, concept); unlike
 * use-concept-options.ts's own ConceptOption (which deliberately narrows
 * away `ttl`, a field no criterion of that task needed), none is narrowed
 * away here -- the Capabilities Browser's own listing table reads name,
 * nature, connector, concept and timeout, and its row-selection detail
 * panel reads that same row's own version, input_schema and output_schema,
 * so every one of the eight is read by some part of that screen.
 *
 * A new sibling hook rather than a reuse of an existing one: GET
 * /v1/capabilities has no existing frontend consumer at all (this app's own
 * inventory, work/frontend-bootstrap/inventory/
 * glossary-and-capabilities-browsers.md, "GET /v1/capabilities has zero
 * frontend precedent today"), so this is the first read of it. Mirrors
 * use-glossary-vocabulary.ts's and use-concept-options.ts's own established
 * convention exactly: apiFetch<PageType>, a query key naming the resource,
 * reading only the page's `data` array (total/limit/offset/pageCount are
 * deliberately left unread, the same convention both of those hooks already
 * keep), and returning {list-field, isLoading, isError, refetch}.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "../services/api-client";

/** domain/integration/capability-nature's own two values. */
export type CapabilityNature = "read-only" | "mutating";

/** domain/integration/capability, every field this app's Capabilities Browser reads. */
export type Capability = {
  readonly name: string;
  readonly version: string;
  readonly nature: CapabilityNature;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;
};

/** The shape of one page of GET /v1/capabilities -- only the field this hook reads. */
type CapabilitiesPage = {
  readonly data: readonly Capability[];
};

export type CapabilitiesResult = {
  readonly capabilities: readonly Capability[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => void;
};

/** Reads every capability the registry currently holds, each field intact. */
export function useCapabilities(): CapabilitiesResult {
  const query: UseQueryResult<CapabilitiesPage> = useQuery({
    queryKey: ["capabilities"],
    queryFn: () => apiFetch<CapabilitiesPage>("/v1/capabilities"),
  });

  return {
    capabilities: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}
