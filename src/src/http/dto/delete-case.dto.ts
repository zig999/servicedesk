import { z } from 'zod';

export const deleteCaseParamsSchema = z.object({
  slug: z.string().min(1),
});

export type DeleteCaseParamsDto = z.infer<typeof deleteCaseParamsSchema>;
