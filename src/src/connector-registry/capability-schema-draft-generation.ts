import { readOpenApiOperation } from './openapi-operation-reader.js';
import { draftedInputSchema } from './capability-schema-draft-input-schema.js';
import { draftedOutputSchema } from './capability-schema-draft-output-schema.js';
import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js';
import type { CapabilitySchemaDraft } from './capability-schema-draft.js';

export type GenerateCapabilitySchemaDraftOptions = {
  readonly link: string;
  readonly path: string;
  readonly method: string;
  readonly documentFetcher: IOpenApiDocumentFetcher;
};

export async function generateCapabilitySchemaDraft(
  options: GenerateCapabilitySchemaDraftOptions,
): Promise<CapabilitySchemaDraft> {
  const { link, path, method, documentFetcher } = options;
  const documentText = await documentFetcher.fetchOpenApiDocument(link);
  const reading = readOpenApiOperation(documentText, path, method);
  const input = draftedInputSchema(reading);
  const output = draftedOutputSchema(reading);
  return {
    input_schema: input.inputSchema,
    output_schema: output.outputSchema,
    unresolved: [...input.unresolved, ...output.unresolved],
  };
}
