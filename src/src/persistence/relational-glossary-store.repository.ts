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
// (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case):
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
// what already exists. writeConcepts (task/concept-authoring/glossary-store-
// concept-write, corrected by task/glossary-concept-write-upsert-hotfix/
// write-concepts-upserts-by-identity) no longer deletes either table whole:
// a delete-then-insert-all "concepts" replace failed the moment any row of
// it — not only the one row a given call meant to replace — was
// permanently referenced by capabilities.concept,
// investigation_evidence.concept or investigation_evaluation_citations.concept
// (migrations/0007-capability-concept.sql, migrations/0005-investigation.sql),
// because the delete cleared every row before any of them was reinserted.
// writeConcepts now upserts each given concept into "concepts" by its own
// name (the table's own primary key) instead: an ordinary insert where that
// name is new, an in-place update of ttl and description where it already
// exists — so a row this call's given set does not name is never a
// DELETE's target, and a row it does name that is itself referenced that
// way is never dropped even for the instant between a delete and its own
// reinsert. concept_accepts is then reconciled per given concept, scoped by
// that concept's own name (concept_name = the given name): its own rows are
// deleted and its own accepted subject types reinserted, one given concept
// at a time, never touching a different concept's own rows and never the
// whole table.
//
// readWholeConcepts and upsertConceptStatement (task/concept-description/
// concept-persistence-carries-description) also carry "concepts".description
// (migrations/0012-glossary-concept-description.sql), read and written
// exactly as the column holds it: NOT NULL DEFAULT '', so a concept row
// stored before this column existed reads back holding the empty string
// rather than failing
// (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone).
//
// Names no import of 'pg', and no longer even names database-connection.ts's
// own DatabaseConnection: this store's own constructor is typed against
// IConnectableQueryable instead (task/persistence-store-connection-typing/
// glossary-store-constructor-typed-to-interface), the connect()-capable
// interface database-access.ts already declares for runInTransaction's own
// sake — a shape the concrete DatabaseConnection (pg Pool) still satisfies
// structurally, with no change to database-connection.ts itself, which
// remains the only module that imports the driver (STK-05).
//
// Every statement below names its table unqualified, the same convention
// relational-capability-store.repository.ts and
// relational-case-store.repository.ts already document at length: it
// resolves against whatever schema the connecting role's own server-side
// default names (persistence/migration-runner.ts's own header describes why
// that default is safe to trust under this project's transaction-pooling
// DATABASE_URL) — true of readTerms, run outside any transaction this
// module opens itself, exactly as it is of writeTerms' and readConcepts'
// own runInTransaction.
import { GlossaryStoreError } from '../errors/glossary-store.error.js';
import type { IGlossaryStore } from '../glossary/glossary-store.port.js';
import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from '../glossary/terms.js';
import { runInTransaction, runStatement, type IConnectableQueryable, type IQueryable, type IStatement } from './database-access.js';

/**
 * One row of "concepts": migrations/0002-glossary-vocabulary.sql's own name
 * and ttl, plus description, which migrations/0012-glossary-concept-
 * description.sql adds NOT NULL DEFAULT '' — a legacy row this store reads
 * back before a description was ever written to it holds the empty string
 * here, never SQL NULL
 * (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone),
 * so this column is always a plain string and never needs translating an
 * absence the domain model does not have.
 */
interface IConceptRow {
  readonly name: string;
  readonly ttl: number;
  readonly description: string;
}

/** One row of "concept_accepts": which concept accepts which subject type (domain/glossary/concept's own accepts). */
interface IConceptAcceptRow {
  readonly concept_name: string;
  readonly subject_type_name: string;
}

/** Each of the five term vocabularies' own schema-qualified table name, keyed by the TermVocabulary name migrations/0002-glossary-vocabulary.sql's own header comment already pairs it with. */
const VOCABULARY_TABLES: Readonly<Record<TermVocabulary, string>> = {
  'subject-type': 'subject_types',
  'subject-attribute': 'subject_attributes',
  outcome: 'outcomes',
  action: 'actions',
  recipient: 'recipients',
};

/** Schema-qualified table names for the concept tables, named once and reused across every statement below rather than repeated as literals (TYP-04). */
const CONCEPTS_TABLE = 'concepts';
const CONCEPT_ACCEPTS_TABLE = 'concept_accepts';

/**
 * The relational adapter of the glossary's store port: each term vocabulary
 * lives in its own table, read fresh on every call (criterion 1, criterion
 * 3) and replaced whole on every writeTerms call, inside one transaction
 * (criterion 4); insertMissingTerms instead adds only what a vocabulary does
 * not already hold, deleting nothing
 * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case);
 * every concept lives in one row of "concepts" plus one row of
 * "concept_accepts" per subject type it accepts, read fresh the same way
 * (criterion 2); writeConcepts upserts each given concept into "concepts"
 * by its own name and reconciles its own concept_accepts rows scoped to
 * that same name, inside one transaction, never deleting a row this call's
 * given set does not name
 * (task/glossary-concept-write-upsert-hotfix/write-concepts-upserts-by-identity's
 * own criteria).
 */
export class RelationalGlossaryStore implements IGlossaryStore {
  public constructor(private readonly connection: IConnectableQueryable) {}

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
   * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
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

  /**
   * Upserts each given concept into "concepts" by its own name — the
   * table's own primary key: a name none of the given concepts holds
   * becomes a new row, and a name one already carries is replaced in
   * place, its ttl and description overwritten with the given values,
   * never dropped and recreated (criterion 1, criterion 2, criterion 3).
   * "concepts" is never the target of a DELETE here (criterion 7), so a row
   * this call's given set does not name — including one permanently
   * referenced by capabilities.concept, investigation_evidence.concept or
   * investigation_evaluation_citations.concept
   * (migrations/0007-capability-concept.sql,
   * migrations/0005-investigation.sql) — is never at risk of that foreign
   * key breaking merely because a different concept was written in the
   * same call (criterion 4), and a concept whose own row is referenced that
   * way keeps answering every one of those references throughout, since it
   * is updated in place rather than deleted at all. Each given concept's
   * own concept_accepts rows are then reconciled scoped to that concept's
   * own name — its rows deleted and its given accepts reinserted — never
   * touching a different concept's own rows (criterion 5), inside the same
   * transaction as every concept's own upsert, so a failure partway through
   * never leaves "concepts" and "concept_accepts" answering for two
   * different sets of names (EDG-05). "concepts".name stays the table's
   * primary key throughout, so no name is ever held in two rows at once
   * (criterion 8).
   */
  public async writeConcepts(concepts: readonly Concept[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const concept of concepts) {
        await runStatement(tx, upsertConceptStatement(concept), raiseWriteFailure);
        await runStatement(tx, deleteConceptAcceptsStatement(concept.name), raiseWriteFailure);
        for (const subjectType of concept.accepts) {
          await runStatement(tx, insertConceptAcceptStatement(concept.name, subjectType), raiseWriteFailure);
        }
      }
    });
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

/**
 * The one upsert-by-identity statement writeConcepts runs per given
 * concept, carrying every field the port method declares (criterion 1,
 * criterion 2, criterion 3): an ordinary insert of name, ttl and
 * description where "concepts" does not yet hold that name, an in-place
 * UPDATE of ttl and description where it already does — never a DELETE, so
 * a row this call's given set does not name is never touched (criterion 4,
 * criterion 7) and a row it does name that some other table permanently
 * references keeps answering that reference throughout (criterion 3).
 * "concepts".name is that table's own primary key, so ON CONFLICT with no
 * target list resolves against it unambiguously, the same convention
 * insertMissingTermStatement already relies on for a term vocabulary's own
 * primary key.
 */
function upsertConceptStatement(concept: Concept): IStatement {
  return {
    text: `INSERT INTO ${CONCEPTS_TABLE} (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description`,
    params: [concept.name, concept.ttl, concept.description],
  };
}

/**
 * The one DELETE writeConcepts runs per given concept, scoped to that
 * concept's own name (concept_name = $1): clears exactly its own
 * concept_accepts rows before insertConceptAcceptStatement reinserts its
 * given accepts, and never a different concept's own rows (criterion 5)
 * nor the whole table (criterion 7).
 */
function deleteConceptAcceptsStatement(conceptName: string): IStatement {
  return { text: `DELETE FROM ${CONCEPT_ACCEPTS_TABLE} WHERE concept_name = $1`, params: [conceptName] };
}

/** The one INSERT each subject type a given concept accepts runs through writeConcepts' own per-concept reconciliation, carrying the "accepts" field the port method declares (criterion 3). */
function insertConceptAcceptStatement(conceptName: string, subjectTypeName: string): IStatement {
  return {
    text: `INSERT INTO ${CONCEPT_ACCEPTS_TABLE} (concept_name, subject_type_name) VALUES ($1, $2)`,
    params: [conceptName, subjectTypeName],
  };
}

/** Reads "concepts" and "concept_accepts" through the one connection the caller's own transaction checked out, and assembles them into the shape readConcepts promises. */
async function readWholeConcepts(tx: IQueryable): Promise<readonly ConceptRegistration[]> {
  const rows = await runStatement<IConceptRow>(
    tx,
    { text: `SELECT name, ttl, description FROM ${CONCEPTS_TABLE}` },
    raiseReadFailure,
  );
  const accepts = await acceptsByConceptName(tx);
  return rows.map((row) => ({ name: row.name, accepts: accepts.get(row.name) ?? [], ttl: row.ttl, description: row.description }));
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
