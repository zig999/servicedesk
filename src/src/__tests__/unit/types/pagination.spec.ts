// the compared shapes disagree; a `// @ts-expect-error` comment is itself refused by the compiler

// a suppressed `@ts-expect-error` line executes as ordinary, harmless JavaScript.

import { expect, expectTypeOf, it } from 'vitest';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

it('a pagination request is exactly an offset and a limit, both numbers, and nothing else', () => {
  expectTypeOf<PaginationRequest>().toEqualTypeOf<{
    readonly offset: number;
    readonly limit: number;
  }>();
});

it('refuses a pagination request literal that also carries a configured bound of its own', () => {
  // @ts-expect-error — PaginationRequest carries only offset and limit; a maximum lives at the

  const invalid: PaginationRequest = { offset: 0, limit: 10, maxLimit: 100 };
  void invalid;
});

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

  const invalid: PaginatedResponse<string> = { data: [], total: 0 };
  void invalid;
});

it("a paginated response's data follows the item type it is instantiated with, rather than a hardcoded shape", () => {
  expectTypeOf<PaginatedResponse<{ id: string }>>().toHaveProperty('data').items.toEqualTypeOf<{
    id: string;
  }>();
});

it('accepts an empty page of items, so a response with no items still satisfies the shape', () => {
  const empty: PaginatedResponse<string> = { data: [], total: 0, limit: 10, offset: 0, pageCount: 0 };

  expect(empty.data).toHaveLength(0);
});
