import { z } from "zod";

export const CAPABILITY_NATURES = ["read-only", "mutating"] as const;

export const capabilityFormSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  timeout: z.number().int().positive().optional(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type CapabilityFormValues = z.infer<typeof capabilityFormSchema>;
