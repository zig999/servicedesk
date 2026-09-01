export type PaginationRequest = {

  readonly offset: number;

  readonly limit: number;
};

export type PaginatedResponse<T> = {

  readonly data: readonly T[];

  readonly total: number;

  readonly limit: number;

  readonly offset: number;

  readonly pageCount: number;
};
