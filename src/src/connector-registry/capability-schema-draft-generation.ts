import { readOpenApiOperation } from './openapi-operation-reader.js';
import { draftedInputSchema } from './capability-schema-draft-input-schema.js';
import { draftedOutputSchema } from './capability-schema-draft-output-schema.js';
import {
  OpenApiDocumentNotReadableError,
  type OpenApiDocumentNotReadableReason,
} from '../errors/openapi-document-not-readable.error.js';
import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js';
import type { CapabilitySchemaDraft } from './capability-schema-draft.js';

export type GenerateCapabilitySchemaDraftOptions = {
  readonly link: string;
  readonly path: string;
  readonly method: string;
  readonly documentFetcher: IOpenApiDocumentFetcher;
};

type OperationLocation = {
  readonly documentText: string;
  readonly path: string;
  readonly method: string;
};

export async function generateCapabilitySchemaDraft(
  options: GenerateCapabilitySchemaDraftOptions,
): Promise<CapabilitySchemaDraft> {
  const { link, path, method, documentFetcher } = options;
  const documentText = await documentFetcher.fetchOpenApiDocument(link);
  const reading = readOperationDisclosingLink({ documentText, path, method }, link);
  const input = draftedInputSchema(reading);
  const output = draftedOutputSchema(reading);
  return {
    input_schema: input.inputSchema,
    output_schema: output.outputSchema,
    unresolved: [...input.unresolved, ...output.unresolved],
  };
}

function readOperationDisclosingLink(location: OperationLocation, link: string) {
  try {
    return readOpenApiOperation(location.documentText, location.path, location.method);
  } catch (error) {
    if (error instanceof OpenApiDocumentNotReadableError) {
      throw readableErrorDisclosingLink(error, link);
    }
    throw error;
  }
}

function readableErrorDisclosingLink(
  error: OpenApiDocumentNotReadableError,
  link: string,
): OpenApiDocumentNotReadableError {
  const reason: OpenApiDocumentNotReadableReason & { readonly link: string } = { ...error.context, link };
  return new OpenApiDocumentNotReadableError(reason, { cause: error });
}
