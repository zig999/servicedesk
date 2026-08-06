/**
 * Encodes `definition/glossary/observation-field`.
 *
 * One named part of what the answer to a concept carries, and what a citation
 * points at. The fields are each concept's own rather than a vocabulary closed
 * for the whole system, so a concept embeds the fields it declares and this
 * module neither enumerates any field nor checks membership anywhere: it
 * carries the name the glossary records.
 *
 * Whether a field a citation names is one the cited concept declares is the
 * citation check's to decide, never this shape's.
 */
export type ObservationField = {
  readonly name: string;
};
