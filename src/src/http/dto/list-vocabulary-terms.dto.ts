import { z } from 'zod';
import { TERM_VOCABULARIES } from '../../glossary/terms.js';

export const listVocabularyTermsParamsSchema = z.object({
  vocabulary: z.enum(TERM_VOCABULARIES),
});

export type ListVocabularyTermsParamsDto = z.infer<typeof listVocabularyTermsParamsSchema>;

export const listVocabularyTermsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListVocabularyTermsQueryDto = z.infer<typeof listVocabularyTermsQuerySchema>;
