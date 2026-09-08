export class OpenApiOperationNotFoundError extends Error {
  public readonly context: Readonly<{ path: string; method: string }>;

  public constructor(path: string, method: string) {
    super(`the OpenAPI document declares no operation for method "${method}" at path "${path}"`);
    this.name = 'OpenApiOperationNotFoundError';
    this.context = { path, method };
  }
}
