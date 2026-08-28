// The relational adapter behind the registry's store port
// (task/relational-stores/capability-store): every registration the
// registry holds lives in one row of "capabilities" — every attribute
// domain/integration/capability declares, including the concept it answers
// (constraints/the-stored-schema-mirrors-the-declared-model,
// migrations/0007-capability-concept.sql) — read fresh from the database on
// every call
// (constraints/the-system-persists-to-one-relational-database). The domain
// declares ICapabilityStore and this class is the infrastructure behind it
// (constraints/the-domain-depends-on-no-infrastructure): no registry module
// imports a driver or opens a file. It implements the same port
// persistence/file-capability-store.repository.ts already implements,
// rather than replacing it.
//
// writeCapabilities upserts each given registration by its own identity
// (name, version) — INSERT ... ON CONFLICT (name, version) DO UPDATE —
// rather than deleting the whole table and reinserting the kept and
// incoming set (task/capability-registry-write-upsert-hotfix): "capabilities"
// (name, version) is referenced by the non-deferrable
// investigation_evidence_capability_fkey (migrations/0005-investigation.sql),
// so a table-wide DELETE failed with Postgres 23503 the moment any row was
// referenced by any investigation_evidence row, however unrelated to the
// identity actually being written. No statement below ever deletes a row of
// "capabilities": a row this call's own given set does not name, including
// one investigation_evidence still cites, is left exactly as it stood.
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, and the runStatement/runInTransaction helpers
// database-access.ts already declares, are the only things this file names
// for the pool it is given (STK-05).
//
// Every statement below names "capabilities" unqualified, the same
// convention persistence/migration-runner.ts's own header already documents
// at length: it resolves against whatever schema the connecting role's own
// server-side default names, safe to trust under this project's
// transaction-pooling DATABASE_URL — true of readCapabilities' own SELECT,
// run outside an already-open transaction, exactly as it is of
// writeCapabilities' own runInTransaction.
import type { ICapabilityStore } from '../capability-registry/capability-store.port.js';
import { CAPABILITY_NATURES, type Capability, type CapabilityNature } from '../capability-registry/capability.js';
import { CapabilityStoreError } from '../errors/capability-store.error.js';
import { runInTransaction, runStatement, type IStatement } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** One row of "capabilities", exactly the columns migrations/0003-capability-registry.sql and migrations/0007-capability-concept.sql together declare. */
interface ICapabilityRow {
  readonly name: string;
  readonly version: string;
  readonly nature: string;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;
}

/** Every nature domain/integration/capability-nature declares, reused rather than re-listing the two values a second time (MNT-03). */
const CAPABILITY_NATURE_VALUES: ReadonlySet<string> = new Set<string>(CAPABILITY_NATURES);

/** Schema-qualified table name, named once and reused across every statement below rather than repeated as a literal three times over (TYP-04) — the same convention persistence/migration-runner.ts's own BOOKKEEPING_TABLE already follows. */
const CAPABILITIES_TABLE = 'capabilities';

/**
 * The relational adapter of the registry's store port: every registration
 * lives in one row of "capabilities", read fresh on every call (criterion
 * 2) and upserted by its own identity (name, version) on every write, inside
 * one transaction (EDG-05), so a failure partway through a batch of
 * registrations never leaves the table holding some of them applied and
 * some not. No write ever deletes a row: one write never touches, let alone
 * removes, a row belonging to a different identity
 * (task/capability-registry-write-upsert-hotfix).
 */
export class RelationalCapabilityStore implements ICapabilityStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  /** Every registration the table holds right now — name, version, nature, both schemas, timeout, connector and concept (criterion 1, criterion 6) — never a value cached from an earlier call (criterion 2). */
  public async readCapabilities(): Promise<readonly Capability[]> {
    const rows = await runStatement<ICapabilityRow>(
      this.connection,
      {
        text: `SELECT name, version, nature, input_schema, output_schema, timeout, connector, concept
               FROM ${CAPABILITIES_TABLE}`,
      },
      raiseReadFailure,
    );
    return rows.map(toCapability);
  }

  /**
   * Upserts each given registration into its own row, scoped by identity
   * (name, version): a new identity is inserted, an already-held one is
   * replaced in place — never by deleting it first
   * (task/capability-registry-write-upsert-hotfix). Every upsert in the
   * given set runs as one unit of work, so a failure partway through leaves
   * none of this call's own writes applied (EDG-05); a row this call does
   * not name, including one investigation_evidence references, is never
   * read, written or deleted by it.
   */
  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const capability of capabilities) {
        await runStatement(tx, upsertStatementFor(capability), raiseWriteFailure);
      }
    });
  }
}

/** Narrows one row's own nature text to the enumeration's two declared values, so a value migrations/0003-capability-registry.sql's own CHECK constraint should already exclude is never merely assumed to have been (TYP-02). */
function isCapabilityNature(value: string): value is CapabilityNature {
  return CAPABILITY_NATURE_VALUES.has(value);
}

/** Maps one row to the Capability the port promises, raising this store's own typed error where a row somehow holds a nature the enumeration does not declare. */
function toCapability(row: ICapabilityRow): Capability {
  if (!isCapabilityNature(row.nature)) {
    throw raiseReadFailure(
      new Error(`capabilities holds an unrecognized nature "${row.nature}" for "${row.name}" version "${row.version}"`),
    );
  }
  return {
    name: row.name,
    version: row.version,
    nature: row.nature,
    input_schema: row.input_schema,
    output_schema: row.output_schema,
    timeout: row.timeout,
    connector: row.connector,
    concept: row.concept,
  };
}

/**
 * The one upsert every given registration runs through writeCapabilities'
 * own per-identity write: inserts a new (name, version) row, or replaces
 * every other attribute of the row already held at that identity — the
 * primary key migrations/0003-capability-registry.sql declares over exactly
 * (name, version) is what ON CONFLICT resolves against — without ever
 * deleting a row (task/capability-registry-write-upsert-hotfix).
 */
function upsertStatementFor(capability: Capability): IStatement {
  return {
    text: `INSERT INTO ${CAPABILITIES_TABLE}
             (name, version, nature, input_schema, output_schema, timeout, connector, concept)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (name, version) DO UPDATE SET
             nature = EXCLUDED.nature,
             input_schema = EXCLUDED.input_schema,
             output_schema = EXCLUDED.output_schema,
             timeout = EXCLUDED.timeout,
             connector = EXCLUDED.connector,
             concept = EXCLUDED.concept`,
    params: [
      capability.name,
      capability.version,
      capability.nature,
      capability.input_schema,
      capability.output_schema,
      capability.timeout,
      capability.connector,
      capability.concept,
    ],
  };
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new CapabilityStoreError('a read against the capability store failed', { operation: 'read' }, { cause });
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new CapabilityStoreError('a write against the capability store failed', { operation: 'write' }, { cause });
}
