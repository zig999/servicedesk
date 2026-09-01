import { z } from 'zod';

export const registerConnectorParamsSchema = z.object({
  connector: z.string().min(1),
});

export type RegisterConnectorParamsDto = z.infer<typeof registerConnectorParamsSchema>;

export const registerConnectorBodySchema = z.object({
  configuration: z.string().min(1),
});

export type RegisterConnectorBodyDto = z.infer<typeof registerConnectorBodySchema>;
