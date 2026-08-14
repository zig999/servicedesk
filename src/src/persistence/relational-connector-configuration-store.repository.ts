// The relational adapter behind the connector-configuration registry's own
// store port (task/connector-registration/connector-configuration-persistence):
// every connector's own call configuration lives in one row of
// "connector_configurations" (migrations/0008-connector-configuration.sql,
// constraints/the-system-persists-to-one-relational-database) — read fresh
// from the database on every call and replaced whole on every write, the
// same shape relational-capability-store.repository.ts already holds for
// the capability registry's own store port. The domain declares
// IConnectorConfigurationStore and this class is the infrastructure behind
// it (constraints/the-domain-depends-on-no-infrastructure): no module under
// the domain layer imports a driver or opens a file for this.
//
// Names no import of 'pg': DatabaseConnection, database-connection.ts's own
// exported type, and the runStatement/runInTransaction helpers
// database-access.ts already declares, are the only things this file names
// for the pool it is given (STK-05).
//
// configuration is typed Record<string, unknown> on the row because
// node-postgres parses a jsonb column into a plain JS value by default —
// the same kind of driver auto-conversion
// relational-investigation-store.repository.ts's own written_at (a Date
// from a timestamptz column) already documents, for a different column
// type. Written back through JSON.stringify: passing JSON text as the
// parameter for a jsonb column and letting Postgres' own input function
// cast it is the ordinary node-pg pattern for this column type, and it
// keeps this module free of any concatenation into the statement text
// itself (SEC-02).
//
// Every statement below is schema-qualified as public.connector_configurations,
// the same convention persistence/migration-runner.ts's own header and
// database-access.spec.ts's own proof already document at length: this
// project's DATABASE_URL reaches Postgres through a transaction-pooling
// endpoint that can hand back a physical connection still carrying an
// unrelated, already-finished session's own search_path.
import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type { IConnectorConfigurationStore } from '../connector-registry/connector-configuration-store.port.js';
import { ConnectorConfigurationStoreError } from '../errors/connector-configuration-store.error.js';
import { runInTransaction, runStatement, type IStatement } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** One row of "connector_configurations", exactly the columns migrations/0008-connector-configuration.sql declares. */
interface IConnectorConfigurationRow {
  readonly connector: string;
  readonly configuration: Record<string, unknown>;
}

/** Schema-qualified table name, named once and reused across every statement below rather than repeated as a literal (TYP-04) — the same convention relational-capability-store.repository.ts's own CAPABILITIES_TABLE already follows. */
const CONNECTOR_CONFIGURATIONS_TABLE = 'public.connector_configurations';

/**
 * The relational adapter of the connector-configuration registry's own
 * store port: every registered connector's configuration lives in one row
 * of "connector_configurations", read fresh on every call (criterion 1) and
 * replaced whole on every write, inside one transaction (EDG-05), so a
 * failure partway through a replace never leaves the table holding a mix of
 * the old and the new set.
 */
export class RelationalConnectorConfigurationStore implements IConnectorConfigurationStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  /** Every connector configuration the table holds right now, never a value cached from an earlier call (criterion 1). */
  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    const rows = await runStatement<IConnectorConfigurationRow>(
      this.connection,
      { text: `SELECT connector, configuration FROM ${CONNECTOR_CONFIGURATIONS_TABLE}` },
      raiseReadFailure,
    );
    return rows.map(toConnectorConfiguration);
  }

  /** Replaces every connector configuration the table holds with exactly the given set, as one unit of work: the existing rows are gone and the new ones are all present, or neither happened (criterion 1). */
  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      await runStatement(tx, { text: `DELETE FROM ${CONNECTOR_CONFIGURATIONS_TABLE}` }, raiseWriteFailure);
      for (const configuration of configurations) {
        await runStatement(tx, insertStatementFor(configuration), raiseWriteFailure);
      }
    });
  }
}

/** Maps one row to the ConnectorConfiguration the port promises. */
function toConnectorConfiguration(row: IConnectorConfigurationRow): ConnectorConfiguration {
  return { connector: row.connector, configuration: row.configuration };
}

/** The one INSERT every kept and incoming configuration runs through writeConnectorConfigurations' own whole replace. */
function insertStatementFor(configuration: ConnectorConfiguration): IStatement {
  return {
    text: `INSERT INTO ${CONNECTOR_CONFIGURATIONS_TABLE} (connector, configuration) VALUES ($1, $2)`,
    params: [configuration.connector, JSON.stringify(configuration.configuration)],
  };
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new ConnectorConfigurationStoreError(
    'a read against the connector-configuration store failed',
    { operation: 'read' },
    { cause },
  );
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new ConnectorConfigurationStoreError(
    'a write against the connector-configuration store failed',
    { operation: 'write' },
    { cause },
  );
}
