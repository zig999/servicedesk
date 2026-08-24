/**
 * Not a business error of the registry itself:
 * capability-registry.service.ts's own readCapabilityByIdentity answers the
 * absence as ordinary data — `{ held: false, name, version }`, never an
 * invented capability and never a failure of the read
 * (task/connector-diagnostics/test-connector-route). POST /v1/test-connector
 * raises this typed error only at the HTTP boundary, once it has read that
 * ordinary `held: false` answer, so the shared status map (COR-04,
 * src/errors/status-map.ts) can resolve the refusal to a transport status
 * in the one place that table lives, rather than a status chosen inline in
 * the route or its controller (criterion 3 — requesting test-connector for
 * a capability that is not registered at all is refused;
 * rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
 * — only an already-registered capability may be tested through).
 */
export class CapabilityNotRegisteredForTestError extends Error {
  public readonly context: Readonly<{ name: string; version: string }>;

  public constructor(name: string, version: string) {
    super(`no capability is currently registered under name "${name}" and version "${version}"`);
    this.name = 'CapabilityNotRegisteredForTestError';
    this.context = { name, version };
  }
}
