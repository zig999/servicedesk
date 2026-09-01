import { z } from "zod";

export const connectorConfigurationFormSchema = z.object({
  connector: z.string().min(1),
});

export type ConnectorConfigurationFormValues = z.infer<
  typeof connectorConfigurationFormSchema
>;
