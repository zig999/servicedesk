// The one module that holds this service's database connection, built from
// the URL environment configuration supplies and from nowhere else
// (constraints/the-database-is-externally-provisioned — the database is
// provisioned outside the deployment and reached only through a connection
// URL supplied as configuration; the deployment itself provisions no
// database service, which is why nothing under this tree declares one).
// This is the only file that imports the driver (STK-05): every adapter this
// plan wires is given the connection this module builds rather than a host,
// a port or a credential of its own, which is what keeps the domain
// layer's own modules — case, glossary, capability registry, investigation
// — free of any driver or framework import
// (constraints/the-domain-depends-on-no-infrastructure).
import { Pool } from 'pg';

/**
 * The connection every adapter of this plan is given. This module is the
 * only place in the tree that knows the database exists as an endpoint;
 * everywhere else, a caller holds this type without ever naming a host, a
 * port or a credential.
 */
export type DatabaseConnection = Pool;

/**
 * Builds the one connection this service reaches its database through, from
 * the given URL alone — no host, port, endpoint or credential is written
 * here, and this function reads none from anywhere but the caller's own
 * configured URL.
 */
export function createDatabaseConnection(connectionUrl: string): DatabaseConnection {
  return new Pool({ connectionString: connectionUrl });
}
