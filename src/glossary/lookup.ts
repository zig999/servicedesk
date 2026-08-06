import type { ActionName } from './action';
import type { Concept } from './concept';
import type { OutcomeName } from './outcome';
import type { RecipientName } from './recipient';
import type { SubjectTypeName } from './subject-type';

/**
 * Encodes `rule/glossary/a-lookup-matches-a-published-name-exactly`.
 *
 * A term looked up in the glossary is answered as published only where it
 * equals a published name of the kind it is looked up as under exact
 * character comparison — no case folding, no trimming, no normalisation of
 * any kind — so a term differing only in letter case from a published name
 * is another term and is answered as not published.
 *
 * The lookup answers from the glossary it was given and holds no term of its
 * own: nothing in this module names a member of any vocabulary, and every
 * answer is read out of the given glossary's published entries.
 */

/**
 * The kind a term is looked up as — one per glossary definition of the base,
 * spelled as the base's own node slugs spell them. A name published under one
 * kind answers nothing about the same spelling looked up as another.
 */
export type GlossaryKind =
  | 'concept'
  | 'subject-type'
  | 'outcome'
  | 'action'
  | 'recipient';

/**
 * The published glossary as the lookup is given it: the published entries of
 * each of the five kinds the exact-lookup rule constrains. A concept is
 * published as its whole record, because a check reads its declared facts;
 * the other four kinds are published as their names, which is the whole of
 * what a value binds them by. This module declares the shape with no way to
 * build one: whoever consults the glossary is handed it.
 */
export type PublishedGlossary = {
  readonly concepts: readonly Concept[];
  readonly subjectTypes: readonly SubjectTypeName[];
  readonly outcomes: readonly OutcomeName[];
  readonly actions: readonly ActionName[];
  readonly recipients: readonly RecipientName[];
};

/**
 * The published names of one kind, read from the given glossary — each
 * concept's name for the concepts, and the published names themselves for
 * the other four kinds.
 */
function publishedNames(
  glossary: PublishedGlossary,
  kind: GlossaryKind,
): readonly string[] {
  switch (kind) {
    case 'concept':
      return glossary.concepts.map((concept: Concept): string => concept.name);
    case 'subject-type':
      return glossary.subjectTypes;
    case 'outcome':
      return glossary.outcomes;
    case 'action':
      return glossary.actions;
    case 'recipient':
      return glossary.recipients;
  }
}

/**
 * Answers whether the given glossary publishes the term under the kind it is
 * looked up as. Published means some published entry of exactly that kind has
 * a name comparing equal to the term character for character; a term the
 * glossary publishes under another kind, or under none, is answered as not
 * published.
 */
export function isPublished(
  glossary: PublishedGlossary,
  term: string,
  kind: GlossaryKind,
): boolean {
  return publishedNames(glossary, kind).some(
    (published: string): boolean => published === term,
  );
}

/**
 * Yields the published concept the term names, exactly as the given glossary
 * records it — the record itself, declared observation fields and all, never
 * a copy — or the absent value where the glossary publishes no concept of
 * that name. The comparison is the same exact character comparison every
 * lookup uses.
 */
export function publishedConcept(
  glossary: PublishedGlossary,
  term: string,
): Concept | undefined {
  return glossary.concepts.find(
    (concept: Concept): boolean => concept.name === term,
  );
}
