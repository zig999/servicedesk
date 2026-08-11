// The process entry point (task/http-surface/diagnose-http-endpoint): the
// only file in this tree that ever calls .listen(). Every module this
// server depends on — build-app.ts, diagnose-server.factory.ts and
// everything they compose — stops at building the app, so importing any of
// them for a test never opens a real port; only running this file does.

import { loadEnv } from './config/env.js';
import { createDiagnoseHttpServer } from './factories/diagnose-server.factory.js';

const env = loadEnv();
const app = await createDiagnoseHttpServer(env);
await app.listen({ port: env.PORT, host: '0.0.0.0' });
