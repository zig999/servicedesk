/**
 * Not a business error of the registry itself:
 * capability-registry.service.ts's own readCapabilityByIdentity answers the
 * absence as ordinary data — `{ held: false, name, version }` — never an
 * invented capability and never a failure of the read
 * (task/registry-reads/read-capability-by-identity-route). GET
 * /v1/capabilities/{name}/{version} raises this typed error only at the HTTP
 * boundary, once it has read that ordinary `held: false` answer, so the
 * shared status map (COR-04, src/errors/status-map.ts) can resolve the
 * refusal to a transport status in the one place that table lives, rather
 * than a status chosen inline in the route or its controller. A fourth,
 * distinct not-found class for the same structural absence
 * ConceptNotAnsweredError, ConnectorConfigurationNotFoundError and
 * CapabilityNotRegisteredForTestError already each answer for their own
 * route, rather than reusing one of those three.
 */
export class CapabilityIdentityNotFoundError extends Error {
  public readonly context: Readonly<{ name: string; version: string }>;

  public constructor(name: string, version: string) {
    super(`no capability is currently registered under name "${name}" and version "${version}"`);
    this.name = 'CapabilityIdentityNotFoundError';
    this.context = { name, version };
  }
}
