import { z } from 'zod';

export const readOpenApiDocumentOperationsRequestSchema = z.object({
  link: z.string().min(1),
});

export type ReadOpenApiDocumentOperationsRequestDto = z.infer<
  typeof readOpenApiDocumentOperationsRequestSchema
>;
