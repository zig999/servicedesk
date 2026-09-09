export interface IOpenApiDocumentFetcher {

  fetchOpenApiDocument(link: string): Promise<string>;
}
