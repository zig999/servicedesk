import { GlossaryStoreError } from '../errors/glossary-store.error.js';
import type { IGlossaryStore } from '../glossary/glossary-store.port.js';
import type { Concept, ConceptRegistration, GlossaryTerm, TermVocabulary } from '../glossary/terms.js';
import { runInTransaction, runStatement, type IConnectableQueryable, type IQueryable, type IStatement } from './database-access.js';

interface IConceptRow {
  readonly name: string;
  readonly ttl: number;
  readonly description: string;
}

interface IConceptAcceptRow {
  readonly concept_name: string;
  readonly subject_type_name: string;
}

const VOCABULARY_TABLES: Readonly<Record<TermVocabulary, string>> = {
  'subject-type': 'subject_types',
  'subject-attribute': 'subject_attributes',
  outcome: 'outcomes',
  action: 'actions',
  recipient: 'recipients',
};

const CONCEPTS_TABLE = 'concepts';
const CONCEPT_ACCEPTS_TABLE = 'concept_accepts';

export class RelationalGlossaryStore implements IGlossaryStore {
  public constructor(private readonly connection: IConnectableQueryable) {}

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return runStatement<GlossaryTerm>(
      this.connection,
      { text: `SELECT name FROM ${VOCABULARY_TABLES[vocabulary]}` },
      raiseReadFailure,
    );
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    const table = VOCABULARY_TABLES[vocabulary];
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      await runStatement(tx, { text: `DELETE FROM ${table}` }, raiseWriteFailure);
      for (const term of terms) {
        await runStatement(tx, insertTermStatement(table, term), raiseWriteFailure);
      }
    });
  }

  public async insertMissingTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    const table = VOCABULARY_TABLES[vocabulary];
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const term of terms) {
        await runStatement(tx, insertMissingTermStatement(table, term), raiseWriteFailure);
      }
    });
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => readWholeConcepts(tx));
  }

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

function insertTermStatement(table: string, term: GlossaryTerm): IStatement {
  return { text: `INSERT INTO ${table} (name) VALUES ($1)`, params: [term.name] };
}

function insertMissingTermStatement(table: string, term: GlossaryTerm): IStatement {
  return { text: `INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, params: [term.name] };
}

function upsertConceptStatement(concept: Concept): IStatement {
  return {
    text: `INSERT INTO ${CONCEPTS_TABLE} (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description`,
    params: [concept.name, concept.ttl, concept.description],
  };
}

function deleteConceptAcceptsStatement(conceptName: string): IStatement {
  return { text: `DELETE FROM ${CONCEPT_ACCEPTS_TABLE} WHERE concept_name = $1`, params: [conceptName] };
}

function insertConceptAcceptStatement(conceptName: string, subjectTypeName: string): IStatement {
  return {
    text: `INSERT INTO ${CONCEPT_ACCEPTS_TABLE} (concept_name, subject_type_name) VALUES ($1, $2)`,
    params: [conceptName, subjectTypeName],
  };
}

async function readWholeConcepts(tx: IQueryable): Promise<readonly ConceptRegistration[]> {
  const rows = await runStatement<IConceptRow>(
    tx,
    { text: `SELECT name, ttl, description FROM ${CONCEPTS_TABLE}` },
    raiseReadFailure,
  );
  const accepts = await acceptsByConceptName(tx);
  return rows.map((row) => ({ name: row.name, accepts: accepts.get(row.name) ?? [], ttl: row.ttl, description: row.description }));
}

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

function raiseReadFailure(cause: unknown): Error {
  return new GlossaryStoreError('a read against the glossary store failed', { operation: 'read' }, { cause });
}

function raiseWriteFailure(cause: unknown): Error {
  return new GlossaryStoreError('a write against the glossary store failed', { operation: 'write' }, { cause });
}
