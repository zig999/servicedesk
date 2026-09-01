import { z } from 'zod';

export const listConnectorConfigurationsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListConnectorConfigurationsQueryDto = z.infer<typeof listConnectorConfigurationsQuerySchema>;
