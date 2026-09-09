export type OpenApiDocumentFetchOutcome =
  | { readonly kind: 'network-failure' }
  | { readonly kind: 'timeout' }
  | { readonly kind: 'status-outside-2xx'; readonly status: number };

export class OpenApiDocumentNotFetchedError extends Error {
  public readonly context: Readonly<{ link: string }> & OpenApiDocumentFetchOutcome;

  public constructor(link: string, outcome: OpenApiDocumentFetchOutcome, options?: ErrorOptions) {
    super(`the OpenAPI document link "${link}" could not be fetched: ${describeOutcome(outcome)}`, options);
    this.name = 'OpenApiDocumentNotFetchedError';
    this.context = { link, ...outcome };
  }
}

function describeOutcome(outcome: OpenApiDocumentFetchOutcome): string {
  switch (outcome.kind) {
    case 'network-failure':
      return 'the link could not be reached';
    case 'timeout':
      return 'the link did not answer before the fetch timeout elapsed';
    case 'status-outside-2xx':
      return `the link answered HTTP ${outcome.status}`;
  }
}
