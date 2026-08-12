// The one vitest configuration this project holds (task/relational-substrate/migration-step,
// criterion 4): wires src/src/vitest-global-setup.ts as the suite's globalSetup, the mechanism
// vitest itself offers for a step that must run once before any test file starts — there is no
// vitest CLI flag for it, so a configuration file is the only place this can be declared. Nothing
// else about how the suite runs is stated here; the "test" script's own "--passWithNoTests" is
// unaffected and still applies.
//
// fileParallelism is disabled as a stopgap: this task's own new Postgres-touching test files
// (migration-runner.spec.ts, vitest-global-setup.spec.ts) open connections against the same
// Neon transaction-pooling endpoint the pre-existing schema-migrations.spec.ts already relies on
// unqualified SET search_path against — running test files concurrently multiplies how often the
// pooler swaps a session's physical backend mid-session, which can move an unqualified statement
// onto a connection that no longer carries the search_path an earlier statement in the same
// logical session just set. Running test files sequentially removes that contention. This does
// not fix the underlying risk — a pooled connection can still be reused across an unrelated
// session's leftover state, one file at a time — it only removes this task's own contribution to
// how often it is provoked; true per-worker database/connection isolation is
// task/relational-substrate/integration-test-isolation's own, not-yet-delivered objective, and
// this finding is direct evidence for it.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/vitest-global-setup.ts'],
    fileParallelism: false,
  },
});
