/**
 * A business error of the connector-request resolver: a placeholder inside
 * the connector's own call configuration names a Subject attribute the
 * Subject the collection stage assembled does not carry — or carries as the
 * empty string — or a credential environment variable this process's own
 * environment does not hold, or holds empty
 * (task/http-observation-runtime/descriptor-placeholder-resolver's own
 * criteria 2 and 3: a credential is read from the environment by name, and
 * resolution over an attribute the Subject does not carry is refused before
 * any request is sent, rather than proceeding with a missing or empty value
 * substituted in its place). Never carries the value that failed to
 * resolve, only its name, so a credential's own value never reaches this
 * error's own message or context even where that value is the empty string
 * a misconfigured deployment left behind (SEC-04).
 */
export class ConnectorPlaceholderNotResolvedError extends Error {
  public readonly context: Readonly<{ kind: 'subject-attribute' | 'credential'; name: string }>;

  public constructor(kind: 'subject-attribute' | 'credential', name: string) {
    super(
      kind === 'subject-attribute'
        ? `a placeholder names a subject attribute the Subject does not carry, or carries as empty: "${name}"`
        : `a placeholder names a credential environment variable that is not set, or is set empty: "${name}"`,
    );
    this.name = 'ConnectorPlaceholderNotResolvedError';
    this.context = { kind, name };
  }
}
