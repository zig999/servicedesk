export type OpenApiDocumentNotReadableReason =
  | { readonly kind: 'unparseable'; readonly detail: string }
  | { readonly kind: 'unsupported-version'; readonly declaredVersion: string }
  | { readonly kind: 'no-version-declared' };

export class OpenApiDocumentNotReadableError extends Error {
  public readonly context: OpenApiDocumentNotReadableReason;

  public constructor(reason: OpenApiDocumentNotReadableReason, options?: ErrorOptions) {
    super(describeReason(reason), options);
    this.name = 'OpenApiDocumentNotReadableError';
    this.context = reason;
  }
}

function describeReason(reason: OpenApiDocumentNotReadableReason): string {
  switch (reason.kind) {
    case 'unparseable':
      return `the OpenAPI document could not be read: ${reason.detail} did not parse as a well-formed OpenAPI 3.x document`;
    case 'unsupported-version':
      return `the OpenAPI document declares version "${reason.declaredVersion}", which is not OpenAPI 3.x`;
    case 'no-version-declared':
      return 'the OpenAPI document declares no openapi or swagger version field';
  }
}
