import { z } from "zod";

export const conceptFormSchema = z.object({
  name: z.string().min(1),
  accepts: z.array(z.string().min(1)).min(1),
  ttl: z.number().int().positive(),
  description: z.string().min(1),
});

export type ConceptFormValues = z.infer<typeof conceptFormSchema>;
