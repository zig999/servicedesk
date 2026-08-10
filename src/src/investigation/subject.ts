// The subject value object as data (domain/investigation/subject): the one
// thing an investigation examines. This module gives that node its own
// canonical home; observation-source.port.ts already declares a
// structurally identical `Subject` inline for its own observe-concept
// parameter, with a comment noting that declaration stands in for this very
// node until it exists — this task's own scope is the factory, so that
// already-delivered port is left untouched rather than refactored to import
// from here (recorded as deferred in this task's own delivery record).

/**
 * The one thing an investigation examines (domain/investigation/subject): a
 * subject type from the glossary and the identifier of the instance. The
 * entry point resolves which instance this is — asking which when there is
 * more than one — before the factory ever builds anything; this module
 * states the shape only, no behavior.
 */
export type Subject = {
  readonly type: string;
  readonly id: string;
};
