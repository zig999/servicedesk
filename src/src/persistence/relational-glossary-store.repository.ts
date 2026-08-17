// The relational adapter behind the glossary's own store port
// (task/relational-stores/glossary-store): each of the five term
// vocabularies lives in its own bare-named table — subject_types,
// subject_attributes, actions, outcomes, recipients — and every concept
// registration lives in one row of "concepts" together with the subject
// types it accepts in "concept_accepts"
// (migrations/0002-glossary-vocabulary.sql). It implements the same
// IGlossaryStore persistence/file-glossary-store.repository.ts already
// implements, rather than replacing it
// (constraints/the-domain-depends-on-no-infrastructure): no glossary
// module imports a driver or opens a file.
//
// readTerms and readConcepts each run a fresh read on every call and
// answer exactly the rows the database currently holds
// (constraints/the-system-persists-to-one-relational-database) — never a
// value remembered from an earlier call, and no term this store invents on
// its own. readConcepts assembles "concepts" and "concept_accepts" into one
// shape inside one transaction, the same reason
// relational-case-store.repository.ts's own readWholeVersion assembles more
// than one table's rows that way (this task's own inference, recorded in
// the delivery). writeTerms replaces one vocabulary's whole table content —
// a DELETE, then one INSERT per given term — inside one transaction, the
// same whole-replace unit of work
// relational-capability-store.repository.ts's own writeCapabilities already
// runs, so a failure partway through never leaves a table holding a mix of
// the old and the new set (EDG-05). insertMissingTerms is the port's own
// narrower sibling to writeTerms
// (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome):
// it runs one INSERT ... ON CONFLICT DO NOTHING per given term, inside one
// transaction the same way (EDG-05 again, now that more than one term can
// go in), issuing no DELETE at all — every already-held row, including one
// some other table now permanently references by foreign key
// (case_versions.fallback_outcome, hypothesis_revisions.resolution_outcome),
// stays exactly as it was. Every vocabulary table's own "name" column is
// already that table's primary key (migrations/0002-glossary-vocabulary.sql),
// so ON CONFLICT DO NOTHING with no target list resolves against it
// unambiguously — the same idempotent-insert shape
// vitest-global-setup.ts's own seedNonConclusionOutcomes already runs
// against this exact table, which this task's own investigation found to be
// this codebase's established way to add what is missing without touching
// what already exists. The port declares no write operation for concepts,
// so this store adds none of its own (this task's own ADVISORY note).
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, and the runStatement/runInTransaction helpers
// database-access.ts already declares, are the only things this file names
// for the pool it is given (STK-05).
//
// Every statement below is schema-qualified as public.<table>, the same
// convention relational-capability-store.repository.ts and
// relational-case-store.repository.ts already document at length: this
// project's DATABASE_URL reaches Postgres through a transaction-pooling
// endpoint that can hand back a physical connection still carrying an
// unrelated, already-finished session's own search_path, so an unqualified
// name run by readTerms — outside any transaction this module opens itself
// — could otherwise resolve against whatever schema happened to be ambient
// rather than against public. Inside writeTerms' and readConcepts' own
// runInTransaction the qualification is kept regardless, even though that
// helper has already reset search_path to public itself, so every
// statement below reads the same way no matter which path runs it.
import { GlossaryStoreError } from '../errors/glossary-store.error.js';
import type { IGlossaryStore } from '../glossary/glossary-store.port.js';
import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from '../glossary/terms.js';
import { runInTransaction, runStatement, type IQueryable, type IStatement } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** One row of "concepts", exactly the columns migrations/0002-glossary-vocabulary.sql declares. */
interface IConceptRow {
  readonly name: string;
  readonly ttl: number;
}

/** One row of "concept_accepts": which concept accepts which subject type (domain/glossary/concept's own accepts). */
interface IConceptAcceptRow {
  readonly concept_name: string;
  readonly subject_type_name: string;
}

/** Each of the five term vocabularies' own schema-qualified table name, keyed by the TermVocabulary name migrations/0002-glossary-vocabulary.sql's own header comment already pairs it with. */
const VOCABULARY_TABLES: Readonly<Record<TermVocabulary, string>> = {
  'subject-type': 'public.subject_types',
  'subject-attribute': 'public.subject_attributes',
  outcome: 'public.outcomes',
  action: 'public.actions',
  recipient: 'public.recipients',
};

/** Schema-qualified table names for the concept tables, named once and reused across every statement below rather than repeated as literals (TYP-04). */
const CONCEPTS_TABLE = 'public.concepts';
const CONCEPT_ACCEPTS_TABLE = 'public.concept_accepts';

/**
 * The relational adapter of the glossary's store port: each term vocabulary
 * lives in its own table, read fresh on every call (criterion 1, criterion
 * 3) and replaced whole on every writeTerms call, inside one transaction
 * (criterion 4); insertMissingTerms instead adds only what a vocabulary does
 * not already hold, deleting nothing
 * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome);
 * every concept lives in one row of "concepts" plus one row of
 * "concept_accepts" per subject type it accepts, read fresh the same way
 * (criterion 2).
 */
export class RelationalGlossaryStore implements IGlossaryStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  /** Every row the named vocabulary's own table currently holds (criterion 1, criterion 3) — never a value cached from an earlier call, and never a name the table does not hold. */
  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return runStatement<GlossaryTerm>(
      this.connection,
      { text: `SELECT name FROM ${VOCABULARY_TABLES[vocabulary]}` },
      raiseReadFailure,
    );
  }

  /** Replaces the named vocabulary's whole table content with exactly the given terms, as one unit of work: the existing rows are gone and the new ones are all present, or neither happened (criterion 4). */
  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    const table = VOCABULARY_TABLES[vocabulary];
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      await runStatement(tx, { text: `DELETE FROM ${table}` }, raiseWriteFailure);
      for (const term of terms) {
        await runStatement(tx, insertTermStatement(table, term), raiseWriteFailure);
      }
    });
  }

  /**
   * Adds to the named vocabulary's table exactly the given terms it does not
   * already hold, and deletes nothing: each runs through its own
   * INSERT ... ON CONFLICT DO NOTHING, inside one transaction so a failure
   * partway through never leaves some of the given terms inserted and
   * others not (EDG-05). A row the vocabulary already holds — including one
   * some other table now permanently references — is never touched
   * (task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome).
   */
  public async insertMissingTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    const table = VOCABULARY_TABLES[vocabulary];
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const term of terms) {
        await runStatement(tx, insertMissingTermStatement(table, term), raiseWriteFailure);
      }
    });
  }

  /** Every concept the table holds right now, each with the subject types it accepts and its ttl (criterion 2), assembled inside one transaction so both tables answer as of one consistent read. */
  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => readWholeConcepts(tx));
  }
}

/** The one INSERT every kept and incoming term runs through writeTerms' own whole replace. */
function insertTermStatement(table: string, term: GlossaryTerm): IStatement {
  return { text: `INSERT INTO ${table} (name) VALUES ($1)`, params: [term.name] };
}

/** The one idempotent INSERT insertMissingTerms runs per given term: a no-op where the vocabulary's own primary key (name) already holds it, an ordinary insert otherwise. */
function insertMissingTermStatement(table: string, term: GlossaryTerm): IStatement {
  return { text: `INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, params: [term.name] };
}

/** Reads "concepts" and "concept_accepts" through the one connection the caller's own transaction checked out, and assembles them into the shape readConcepts promises. */
async function readWholeConcepts(tx: IQueryable): Promise<readonly ConceptRegistration[]> {
  const rows = await runStatement<IConceptRow>(tx, { text: `SELECT name, ttl FROM ${CONCEPTS_TABLE}` }, raiseReadFailure);
  const accepts = await acceptsByConceptName(tx);
  return rows.map((row) => ({ name: row.name, accepts: accepts.get(row.name) ?? [], ttl: row.ttl }));
}

/** Every subject type each concept accepts, grouped by the concept's own name — concept_accepts carries no order of its own, so each group is read back sorted by subject type name for a deterministic result. */
async function acceptsByConceptName(tx: IQueryable): Promise<ReadonlyMap<string, readonly string[]>> {
  const rows = await runStatement<IConceptAcceptRow>(
    tx,
    { text: `SELECT concept_name, subject_type_name FROM ${CONCEPT_ACCEPTS_TABLE} ORDER BY concept_name, subject_type_name` },
    raiseReadFailure,
  );
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    const types = grouped.get(row.concept_name) ?? [];
    types.push(row.subject_type_name);
    grouped.set(row.concept_name, types);
  }
  return grouped;
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new GlossaryStoreError('a read against the glossary store failed', { operation: 'read' }, { cause });
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new GlossaryStoreError('a write against the glossary store failed', { operation: 'write' }, { cause });
}
