import { z } from 'zod';
import { TERM_VOCABULARIES } from '../../glossary/terms.js';

export const readVocabularyTermParamsSchema = z.object({
  vocabulary: z.enum(TERM_VOCABULARIES),
  name: z.string().min(1),
});

export type ReadVocabularyTermParamsDto = z.infer<typeof readVocabularyTermParamsSchema>;

export const readVocabularyTermResponseSchema = z.object({
  name: z.string().min(1),
});

export type ReadVocabularyTermResponseDto = z.infer<typeof readVocabularyTermResponseSchema>;
