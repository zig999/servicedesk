// The relational adapter behind the connector-configuration registry's own
// store port (task/connector-registration/connector-configuration-persistence):
// every connector's own call configuration lives in one row of
// "connector_configurations" (migrations/0008-connector-configuration.sql,
// constraints/the-system-persists-to-one-relational-database) — read fresh
// from the database on every call. The domain declares
// IConnectorConfigurationStore and this class is the infrastructure behind
// it (constraints/the-domain-depends-on-no-infrastructure): no module under
// the domain layer imports a driver or opens a file for this.
//
// writeConnectorConfigurations upserts each given configuration by its own
// connector identity — INSERT ... ON CONFLICT (connector) DO UPDATE — rather
// than deleting the whole table and reinserting the kept and incoming set
// (task/connector-configuration-write-upsert-hotfix): a table-wide DELETE
// run ahead of the caller's own read-filter-append-write
// (connector-configuration-registry.service.ts's own registerConnector)
// leaves a window in which a second write, or a read racing the same
// transaction, sees the table holding nothing at all for every connector
// this call's own given set does not name, and a failure between the
// DELETE and its own reinsert loses every connector configuration this
// call was never asked to touch. No statement below ever deletes a row of
// "connector_configurations": a row this call's own given set does not
// name is left exactly as it stood. The same upsert-by-identity fix
// relational-capability-store.repository.ts's own writeCapabilities
// already carries for its own primary key (task/capability-registry-write-upsert-hotfix).
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
// type. connector-configuration.ts's own ConnectorConfiguration.configuration
// holds and answers this same field as JSON object text
// (task/connector-configuration-registration-conformance/configuration-held-as-text,
// domain/integration/connector-configuration), so toConnectorConfiguration
// below re-serializes the row's own driver-parsed object back to that text
// (JSON.stringify) on every read, and upsertStatementFor passes the
// domain's own already-held text straight through as the jsonb column's
// parameter on every write — letting Postgres' own input function cast that
// text is the ordinary node-pg pattern for this column type, and it keeps
// this module free of any concatenation into the statement text itself
// (SEC-02).
//
// Every statement below names "connector_configurations" unqualified, the
// same convention persistence/migration-runner.ts's own header already
// documents at length: it resolves against whatever schema the connecting
// role's own server-side default names, safe to trust under this project's
// transaction-pooling DATABASE_URL.
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
const CONNECTOR_CONFIGURATIONS_TABLE = 'connector_configurations';

/**
 * The relational adapter of the connector-configuration registry's own
 * store port: every registered connector's configuration lives in one row
 * of "connector_configurations", read fresh on every call (criterion 1) and
 * upserted by its own connector identity on every write, inside one
 * transaction (EDG-05), so a failure partway through a batch of
 * registrations never leaves the table holding some of them applied and
 * some not. No write ever deletes a row: one write never touches, let
 * alone removes, a row belonging to a different connector
 * (task/connector-configuration-write-upsert-hotfix).
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

  /**
   * Upserts each given configuration into its own row, scoped by connector
   * identity: a new connector is inserted, an already-held one is replaced
   * in place — never by deleting it first
   * (task/connector-configuration-write-upsert-hotfix). Every upsert in the
   * given set runs as one unit of work, so a failure partway through leaves
   * none of this call's own writes applied (EDG-05); a row this call does
   * not name is never read, written or deleted by it.
   */
  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const configuration of configurations) {
        await runStatement(tx, upsertStatementFor(configuration), raiseWriteFailure);
      }
    });
  }
}

/**
 * Maps one row to the ConnectorConfiguration the port promises —
 * re-serializing the row's own driver-parsed object back into the JSON
 * object text the domain type now holds
 * (task/connector-configuration-registration-conformance/configuration-held-as-text).
 */
function toConnectorConfiguration(row: IConnectorConfigurationRow): ConnectorConfiguration {
  return { connector: row.connector, configuration: JSON.stringify(row.configuration) };
}

/**
 * The one upsert every given configuration runs through
 * writeConnectorConfigurations' own per-identity write: inserts a new
 * connector row, or replaces the configuration of the row already held at
 * that connector — the primary key
 * migrations/0008-connector-configuration.sql declares over exactly
 * "connector" is what ON CONFLICT resolves against — without ever deleting
 * a row (task/connector-configuration-write-upsert-hotfix). configuration
 * is passed through as is: the domain type already holds it as the JSON
 * object text this jsonb column's own input function expects
 * (task/connector-configuration-registration-conformance/configuration-held-as-text),
 * so this statement no longer re-serializes it.
 */
function upsertStatementFor(configuration: ConnectorConfiguration): IStatement {
  return {
    text: `INSERT INTO ${CONNECTOR_CONFIGURATIONS_TABLE} (connector, configuration)
           VALUES ($1, $2)
           ON CONFLICT (connector) DO UPDATE SET configuration = EXCLUDED.configuration`,
    params: [configuration.connector, configuration.configuration],
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
