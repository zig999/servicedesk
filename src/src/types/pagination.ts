// The one pagination shape every listing operation and every listing HTTP
// route shares (task/case-query-http/pagination-types): greenfield, and
// depended on by every other listing task this initiative cuts
// (task/case-query-http/list-cases-store-extension,
// list-case-versions-store-extension, list-hypotheses-store-extension,
// list-hypothesis-revisions-store-extension and their four *-route
// counterparts), so the two exports below are named and shaped for direct
// reuse rather than per-module redeclaration.
//
// Answers to no specification node: the task's own binder found no
// candidate node — the case-query contract, the five knowledge domain
// models, or the-case-is-read-whole constraint — stating anything about how
// a listing is paged, so this shape is entirely the project's own standard's
// concern (backend-node-service.yaml's API-01 through API-04), never a
// domain fact.
//
// PaginationRequest is deliberately just offset and limit, with no schema
// of its own: bounding a limit against a configured default and maximum
// (API-04 — "neither the default nor the maximum is written in source") is
// a controller/route concern the standard scopes away from this module (its
// applies_to names .controller.ts and .routes.ts, never src/types), so no
// configured value is read here — a route's own DTO validates the raw query
// string against the configured bound and produces this type, never the
// reverse.
//
// PaginatedResponse<T> is the "shared PaginatedResponse type imported from
// src/types/pagination.ts, never redeclared per module" API-01 names
// verbatim (its own seen_at names this exact file). Beyond the two fields
// its criterion states in the task — a page of items alongside a total
// count, named data and total below in API-02's own words ("the paginated
// envelope carrying an empty data array") — it also carries limit, offset
// and pageCount: API-03 requires every listing service or controller to
// "always compute[ ] the page count from the total and the limit, and
// never hardcode[ ] or omit[ ] it", and API-01 forbids any module from
// redeclaring or extending this envelope to carry that computed value ad
// hoc. The only way both rules hold together is for the one shared
// envelope to already have a field for it, so pageCount is declared here
// even though this task's own criteria do not name it by itself — an
// inference from those two rules taken together, not a fact this file
// invents on its own. This module computes nothing: every field's value is
// still supplied by whichever service or controller assembles one.

/** What a caller asks a listing operation for: an offset-limit window over its results. */
export type PaginationRequest = {
  /** How many matching items precede the first one this page returns. */
  readonly offset: number;
  /** The most items this page may carry. */
  readonly limit: number;
};

/**
 * The one envelope every paginated listing answers with (API-01): the page
 * of items themselves, alongside enough of the pagination it was read
 * against for a caller to page further without recomputing anything the
 * server already knows.
 */
export type PaginatedResponse<T> = {
  /** This page's own items, in the order the listing operation returned them. */
  readonly data: readonly T[];
  /** How many items match in total, across every page. */
  readonly total: number;
  /** The limit this page was produced with. */
  readonly limit: number;
  /** The offset this page was produced with. */
  readonly offset: number;
  /** The page count this limit divides total into (API-03). */
  readonly pageCount: number;
};
