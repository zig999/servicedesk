import { z } from 'zod';

export const removeConnectorParamsSchema = z.object({
  connector: z.string().min(1),
});

export type RemoveConnectorParamsDto = z.infer<typeof removeConnectorParamsSchema>;
