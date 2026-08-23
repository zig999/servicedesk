// Proxy que grava. Fica entre o engine e um sistema externo, encaminha tudo sem
// alterar nada, e escreve um registro NDJSON por par requisição/resposta.
//
//   node proxy.mjs --port 8898 --upstream http://127.0.0.1:8787 --name ifs
//   node proxy.mjs --port 8899 --upstream https://api.anthropic.com --name anthropic
//
// Cabeçalhos de credencial são substituídos por <REDACTED> no registro; para o
// upstream vão intactos, senão a chamada não autenticaria.

import { createWriteStream } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const PORT = Number(arg('port'));
const UPSTREAM = new URL(arg('upstream'));
const NAME = arg('name', 'proxy');
const REDACT = new Set(['x-api-key', 'authorization', 'proxy-authorization', 'cookie']);

const log = createWriteStream(new URL(`./raw/${NAME}.ndjson`, import.meta.url), { flags: 'a' });
const write = (record) => log.write(`${JSON.stringify(record)}\n`);

const redacted = (headers) =>
  Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, REDACT.has(k.toLowerCase()) ? '<REDACTED>' : v]),
  );

/** Desfaz a compressão que o upstream aplicou, para que o registro guarde texto e não bytes. */
const decoded = (raw, encoding) => {
  if (encoding === undefined) return raw;
  try {
    if (encoding.includes('br')) return brotliDecompressSync(raw);
    if (encoding.includes('gzip')) return gunzipSync(raw);
    if (encoding.includes('deflate')) return inflateSync(raw);
  } catch {
    return raw;
  }
  return raw;
};

const parsed = (raw, encoding) => {
  if (raw.length === 0) return null;
  const text = decoded(raw, encoding).toString('utf8');
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

let seq = 0;

http
  .createServer((request, response) => {
    const n = ++seq;
    const startedAt = new Date().toISOString();
    const startedMs = performance.now();
    const chunks = [];
    request.on('data', (c) => chunks.push(c));
    request.on('end', () => {
      const requestBody = Buffer.concat(chunks);
      const driver = UPSTREAM.protocol === 'https:' ? https : http;
      const outbound = driver.request(
        {
          protocol: UPSTREAM.protocol,
          hostname: UPSTREAM.hostname,
          port: UPSTREAM.port || (UPSTREAM.protocol === 'https:' ? 443 : 80),
          method: request.method,
          path: request.url,
          headers: (() => {
            const forwarded = { ...request.headers, host: UPSTREAM.host };
            delete forwarded['accept-encoding'];
            return forwarded;
          })(),
        },
        (upstream) => {
          const outChunks = [];
          upstream.on('data', (c) => outChunks.push(c));
          upstream.on('end', () => {
            const responseBody = Buffer.concat(outChunks);
            write({
              seq: n,
              name: NAME,
              started_at: startedAt,
              duration_ms: Math.round(performance.now() - startedMs),
              request: {
                method: request.method,
                url: request.url,
                headers: redacted(request.headers),
                body: parsed(requestBody),
              },
              response: {
                status: upstream.statusCode,
                headers: redacted(upstream.headers),
                body: parsed(responseBody, upstream.headers['content-encoding']),
              },
            });
            response.writeHead(upstream.statusCode ?? 502, upstream.headers);
            response.end(responseBody);
          });
        },
      );
      outbound.on('error', (error) => {
        write({
          seq: n,
          name: NAME,
          started_at: startedAt,
          duration_ms: Math.round(performance.now() - startedMs),
          request: { method: request.method, url: request.url, headers: redacted(request.headers), body: parsed(requestBody) },
          error: { message: error.message, code: error.code },
        });
        response.writeHead(502).end();
      });
      outbound.end(requestBody);
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`${NAME}: 127.0.0.1:${PORT} -> ${UPSTREAM.origin}`));
