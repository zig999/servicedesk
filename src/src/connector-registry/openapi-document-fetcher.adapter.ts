import {
  OpenApiDocumentNotFetchedError,
  type OpenApiDocumentFetchOutcome,
} from '../errors/openapi-document-not-fetched.error.js';
import type { IOpenApiDocumentFetcher } from './openapi-document-fetcher.port.js';

const OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS = 60_000;

export type OpenApiDocumentFetcherOptions = {
  readonly httpClient?: typeof fetch;
};

export class OpenApiDocumentFetcher implements IOpenApiDocumentFetcher {
  private readonly httpClient: typeof fetch;

  public constructor(options: OpenApiDocumentFetcherOptions = {}) {
    this.httpClient = options.httpClient ?? fetch;
  }

  public async fetchOpenApiDocument(link: string): Promise<string> {
    const response = await this.issuedResponse(link);
    if (!response.ok) {
      throw new OpenApiDocumentNotFetchedError(link, { kind: 'status-outside-2xx', status: response.status });
    }
    return await response.text();
  }

  private async issuedResponse(link: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OPENAPI_DOCUMENT_FETCH_TIMEOUT_MS);
    try {
      return await this.httpClient(link, { signal: controller.signal });
    } catch (error) {
      throw new OpenApiDocumentNotFetchedError(link, outcomeForRejection(controller), { cause: error });
    } finally {
      clearTimeout(timer);
    }
  }
}

function outcomeForRejection(controller: AbortController): OpenApiDocumentFetchOutcome {
  return controller.signal.aborted ? { kind: 'timeout' } : { kind: 'network-failure' };
}
