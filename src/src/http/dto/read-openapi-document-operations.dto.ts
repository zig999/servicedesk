import { z } from 'zod';

export const readOpenApiDocumentOperationsQuerySchema = z.object({
  link: z.string().min(1),
});

export type ReadOpenApiDocumentOperationsQueryDto = z.infer<
  typeof readOpenApiDocumentOperationsQuerySchema
>;
