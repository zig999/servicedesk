// Compile-time proof for src/types/pagination.ts (task/case-query-http/pagination-types).
// PaginationRequest and PaginatedResponse<T> are pure type declarations — nothing here executes
// at runtime that a stand-in could break, so a runtime `expect` comparing a value this file just
// constructed to itself would prove nothing about the type; it is what TypeScript's own checker
// says at `npm run typecheck` that falsifies a wrong shape (STK-01 holds every .ts under src to
// it, nested, which includes this file). `expectTypeOf(...).toEqualTypeOf<...>()` — built into
// vitest, re-exported from the `expect-type` package that ships as one of vitest's own
// dependencies, so nothing new is installed for this file — resolves to a type error the moment
// the compared shapes disagree; a `// @ts-expect-error` comment is itself refused by the compiler
// as an "unused directive" (TS2578) the moment the line beneath it stops erroring. Both mechanisms
// are checked by the same `npm run typecheck` step this project already runs, not by anything
// vitest's runtime observes — a call to `expectTypeOf` has no meaningful behaviour at runtime and
// a suppressed `@ts-expect-error` line executes as ordinary, harmless JavaScript.
//
// This codebase carries no established convention for testing a pure type module: no existing
// *.spec.ts exercises one (durations.ts, cost.ts, citation.ts and evidence-result.ts, the other
// plain-shape modules under src/investigation, are all proven only indirectly, through whichever
// caller constructs a value of the type). This file is this task's own answer to that gap, using
// the type-checking facility vitest already ships rather than inventing one.
import { expect, expectTypeOf, it } from 'vitest';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

// ---------------------------------------------------------------- criterion 1: the pagination request

it('a pagination request is exactly an offset and a limit, both numbers, and nothing else', () => {
  expectTypeOf<PaginationRequest>().toEqualTypeOf<{
    readonly offset: number;
    readonly limit: number;
  }>();
});

it('refuses a pagination request literal that also carries a configured bound of its own', () => {
  // @ts-expect-error — PaginationRequest carries only offset and limit; a maximum lives at the
  // route boundary (API-04), never on this shared type.
  const invalid: PaginationRequest = { offset: 0, limit: 10, maxLimit: 100 };
  void invalid;
});

// ---------------------------------------------------------------- criterion 2: the paginated envelope

it('a paginated response carries a page of items and a total count, whatever the item type', () => {
  expectTypeOf<PaginatedResponse<string>>().toMatchObjectType<{
    readonly data: readonly string[];
    readonly total: number;
  }>();
});

it('a paginated response is exactly the page of items, the total, and the limit, offset and page count it was produced with', () => {
  expectTypeOf<PaginatedResponse<string>>().toEqualTypeOf<{
    readonly data: readonly string[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
    readonly pageCount: number;
  }>();
});

it('refuses a paginated response literal that omits the limit, offset or page count it was produced with', () => {
  // @ts-expect-error — API-01 and API-03 read together require the shared envelope to already
  // carry the computed page count, limit and offset, so none of the three is optional here.
  const invalid: PaginatedResponse<string> = { data: [], total: 0 };
  void invalid;
});

it("a paginated response's data follows the item type it is instantiated with, rather than a hardcoded shape", () => {
  expectTypeOf<PaginatedResponse<{ id: string }>>().toHaveProperty('data').items.toEqualTypeOf<{
    id: string;
  }>();
});

// ------------------------------------------------------------------- edge case: an empty page

it('accepts an empty page of items, so a response with no items still satisfies the shape', () => {
  const empty: PaginatedResponse<string> = { data: [], total: 0, limit: 10, offset: 0, pageCount: 0 };

  expect(empty.data).toHaveLength(0);
});
