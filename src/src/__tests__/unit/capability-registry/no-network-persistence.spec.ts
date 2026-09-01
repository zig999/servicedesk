import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const SOURCE_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const AUDITED_DIRECTORIES = ['capability-registry', 'persistence', 'factories'];

const NETWORK_REACHES: readonly { readonly means: string; readonly pattern: RegExp }[] = [
  { means: 'imports a node network module', pattern: /['"]node:(?:http|https|http2|net|tls|dgram|dns)['"]/ },
  { means: 'imports a network client package', pattern: /['"](?:http|https|http2|net|tls|undici|axios|got|node-fetch|ws)['"]/ },
  { means: 'calls the global fetch client', pattern: /\bfetch\s*\(/ },
  { means: 'opens a WebSocket', pattern: /\bWebSocket\b/ },
  { means: 'uses XMLHttpRequest', pattern: /\bXMLHttpRequest\b/ },
];

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
