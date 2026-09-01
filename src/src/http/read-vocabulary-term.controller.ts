import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import { VocabularyTermNotHeldError } from '../errors/vocabulary-term-not-held.error.js';
import type { ReadVocabularyTermParamsDto, ReadVocabularyTermResponseDto } from './dto/read-vocabulary-term.dto.js';

export type ReadVocabularyTermControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
};

export async function handleReadVocabularyTermRequest(
  dependencies: ReadVocabularyTermControllerDependencies,
  params: ReadVocabularyTermParamsDto,
): Promise<ReadVocabularyTermResponseDto> {
  const resolution = await dependencies.glossaryQuery.readVocabularyTerm(params.vocabulary, params.name);
  if (!resolution.held) {
    throw new VocabularyTermNotHeldError(resolution.vocabulary, resolution.name);
  }
  return { name: resolution.term.name };
}
