// The relational adapter behind the registry's store port
// (task/relational-stores/capability-store): every registration the
// registry holds lives in one row of "capabilities" — every attribute
// domain/integration/capability declares, including the concept it answers
// (constraints/the-stored-schema-mirrors-the-declared-model,
// migrations/0007-capability-concept.sql) — read fresh from the database on
// every call and replaced whole on every write
// (constraints/the-system-persists-to-one-relational-database). The domain
// declares ICapabilityStore and this class is the infrastructure behind it
// (constraints/the-domain-depends-on-no-infrastructure): no registry module
// imports a driver or opens a file. It implements the same port
// persistence/file-capability-store.repository.ts already implements,
// rather than replacing it.
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, and the runStatement/runInTransaction helpers
// database-access.ts already declares, are the only things this file names
// for the pool it is given (STK-05).
//
// Every statement below is schema-qualified as public.capabilities, the
// same convention persistence/migration-runner.ts's own header and
// database-access.spec.ts's own proof already document at length: this
// project's DATABASE_URL reaches Postgres through a transaction-pooling
// endpoint that can hand back a physical connection still carrying an
// unrelated, already-finished session's own search_path, so an unqualified
// name run outside an already-open transaction — as readCapabilities' own
// SELECT is — could otherwise resolve against whatever schema happened to
// be ambient rather than against public. Inside writeCapabilities' own
// runInTransaction the qualification is likewise kept, even though that
// helper has already reset search_path to public itself, so every
// statement below reads the same way regardless of which path runs it.
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
const CAPABILITIES_TABLE = 'public.capabilities';

/**
 * The relational adapter of the registry's store port: every registration
 * lives in one row of "capabilities", read fresh on every call (criterion
 * 2) and replaced whole on every write, inside one transaction (EDG-05), so
 * a failure partway through a replace never leaves the table holding a mix
 * of the old and the new set.
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

  /** Replaces every registration the table holds with exactly the given set, as one unit of work: the existing rows are gone and the new ones are all present, or neither happened. */
  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      await runStatement(tx, { text: `DELETE FROM ${CAPABILITIES_TABLE}` }, raiseWriteFailure);
      for (const capability of capabilities) {
        await runStatement(tx, insertStatementFor(capability), raiseWriteFailure);
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

/** The one INSERT every kept and incoming registration runs through writeCapabilities' own whole replace. */
function insertStatementFor(capability: Capability): IStatement {
  return {
    text: `INSERT INTO ${CAPABILITIES_TABLE}
             (name, version, nature, input_schema, output_schema, timeout, connector, concept)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
