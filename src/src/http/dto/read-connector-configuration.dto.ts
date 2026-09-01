import { z } from 'zod';

export const readConnectorConfigurationParamsSchema = z.object({
  connector: z.string().min(1),
});

export type ReadConnectorConfigurationParamsDto = z.infer<typeof readConnectorConfigurationParamsSchema>;

export const readConnectorConfigurationResponseSchema = z.object({
  connector: z.string().min(1),
  configuration: z.string().min(1),
});

export type ReadConnectorConfigurationResponseDto = z.infer<typeof readConnectorConfigurationResponseSchema>;
