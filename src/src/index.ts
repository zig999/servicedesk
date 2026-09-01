import { loadEnv } from './config/env.js';
import { createDiagnoseHttpServer } from './factories/diagnose-server.factory.js';

const env = loadEnv();
const app = await createDiagnoseHttpServer(env);
await app.listen({ port: env.PORT, host: '0.0.0.0' });
