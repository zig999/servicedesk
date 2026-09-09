import { z } from 'zod';

export const draftConnectorConfigurationFromOpenApiRequestSchema = z.object({
  connector: z.string().min(1),
  link: z.string().min(1),
  path: z.string().min(1),
  method: z.string().min(1),
});

export type DraftConnectorConfigurationFromOpenApiRequestDto = z.infer<
  typeof draftConnectorConfigurationFromOpenApiRequestSchema
>;
