// An audit over the registration path — the registry module, the persistence
// adapters and the factories that wire them: no file reaches a service over
// the network. Criterion 5 checks only a driver-free manifest and JSON files,
// so an implementation persisting JSON while also reaching a database service
// without a driver, over HTTP, would satisfy it as written; this audit is
// what excludes that implementation (constraints/the-mvp-persists-to-no-database
// — the MVP runs against no database; persistence is the filesystem alone).
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const SOURCE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** The directories a registration passes through on its way to persistence. */
const AUDITED_DIRECTORIES = ['capability-registry', 'persistence', 'factories'];

/** Every way source text reaches the network: a network module imported, or a global network client used. */
const NETWORK_REACHES: readonly { readonly means: string; readonly pattern: RegExp }[] = [
  { means: 'imports a node network module', pattern: /['"]node:(?:http|https|http2|net|tls|dgram|dns)['"]/ },
  { means: 'imports a network client package', pattern: /['"](?:http|https|http2|net|tls|undici|axios|got|node-fetch|ws)['"]/ },
  { means: 'calls the global fetch client', pattern: /\bfetch\s*\(/ },
  { means: 'opens a WebSocket', pattern: /\bWebSocket\b/ },
  { means: 'uses XMLHttpRequest', pattern: /\bXMLHttpRequest\b/ },
];

/** Reads every audited module's source text, keyed by its path; refuses an empty audit. */
async function auditedSources(): Promise<ReadonlyMap<string, string>> {
  const sources = new Map<string, string>();
  for (const directory of AUDITED_DIRECTORIES) {
    const files = (await readdir(join(SOURCE_ROOT, directory))).filter((file) => file.endsWith('.ts'));
    for (const file of files) {
      sources.set(`${directory}/${file}`, await readFile(join(SOURCE_ROOT, directory, file), 'utf8'));
    }
  }
  if (sources.size === 0) {
    throw new Error('no module found to audit — the pass would be vacuous');
  }
  return sources;
}

/** Every offending reach, named by file and means so a failure says where. */
function networkReachesAmong(sources: ReadonlyMap<string, string>): string[] {
  const offenders: string[] = [];
  for (const [file, source] of sources) {
    for (const reach of NETWORK_REACHES.filter((candidate) => candidate.pattern.test(source))) {
      offenders.push(`${file} ${reach.means}`);
    }
  }
  return offenders;
}

it('the registration path reaches no service over the network — persistence is the filesystem alone', async () => {
  const sources = await auditedSources();

  const offenders = networkReachesAmong(sources);

  expect(offenders).toEqual([]);
});
