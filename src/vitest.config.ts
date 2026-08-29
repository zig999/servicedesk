// The one vitest configuration this project holds (task/relational-substrate/migration-step,
// criterion 4): wires src/src/vitest-global-setup.ts as the suite's globalSetup, the mechanism
// vitest itself offers for a step that must run once before any test file starts — there is no
// vitest CLI flag for it, so a configuration file is the only place this can be declared. Nothing
// else about how the suite runs is stated here; the "test" script's own "--passWithNoTests" is
// unaffected and still applies.
//
// fileParallelism is disabled as a stopgap: this task's own new Postgres-touching test files
// (migration-runner.spec.ts, vitest-global-setup.spec.ts) open connections against the same
// externally-provisioned transaction-pooling endpoint the pre-existing schema-migrations.spec.ts
// already relies on unqualified SET search_path against — running test files concurrently
// multiplies how often the pooler swaps a session's physical backend mid-session, which can move
// an unqualified statement onto a connection that no longer carries the search_path an earlier
// statement in the same logical session just set. Running test files sequentially removes that
// contention. This does not fix the underlying risk — a pooled connection can still be reused
// across an unrelated session's leftover state, one file at a time — it only removes this task's
// own contribution to how often it is provoked; true per-worker database/connection isolation is
// task/relational-substrate/integration-test-isolation's own, not-yet-delivered objective, and
// this finding is direct evidence for it.
//
// testTimeout is raised from vitest's own 5000ms default (task/relational-stores/glossary-store,
// fixed and disclosed in that task's own delivery): several integration specs across this
// initiative open more than five sequential round trips to the real, externally provisioned
// Neon endpoint inside one test (a whole-aggregate write followed by a whole-aggregate read is
// the recurring shape), and real network latency on that connection has been observed to push a
// single test past 5000ms without any fault the test is trying to provoke — first in
// relational-glossary-store.repository.spec.ts's own five-vocabulary round trip, then in
// relational-case-store.repository.spec.ts's own whole-case read.
//
// Raised again, to 40000ms (task/service-on-the-database/store-wiring, disclosed in that task's
// own delivery): production-diagnose.factory.ts's own TOTAL_DEADLINE_BUDGET_MS already bounds one
// production diagnose call to 20000ms end to end. A vitest testTimeout equal to or only slightly
// above that internal deadline can itself expire at nearly the same instant the deadline does
// under real Neon latency, aborting a test — and, on this project's own worker teardown, its
// afterEach cleanup — before that cleanup can finish deleting the investigation the call just
// wrote, leaving an orphaned row that then breaks a later, unrelated test's own DELETE against a
// table that row's own foreign key still holds open (diagnose-server.factory.spec.ts's and
// diagnose-e2e.spec.ts's own end-to-end HTTP integration tests are the first in this initiative to
// exercise that internal deadline against the real database rather than a mock). Doubling the
// test timeout over the application's own internal deadline gives every test's own afterEach
// cleanup real headroom to run to completion even when a call it drove genuinely exhausts its own
// 20-second budget.
//
// Raised again, to 120000ms
// (task/migration-runner-comment-hang-corrective/strip-leading-comments-before-applying, disclosed
// in that task's own delivery): several of this suite's own integration specs replay every script
// under migrations/ against the real database in one test, from an empty schema, one script at a
// time — twelve scripts today, each its own round trip. A full, sequential, from-scratch replay of
// that kind was observed hanging indefinitely, traced in this same task's own delivery to a Path
// MTU Discovery black hole on one developer's own network path (a VPN'd WSL2 host) rather than to
// real database latency: a migration script's own wire size, comment lines included, could exceed
// that path's real MTU, and an oversized packet was silently dropped with no ICMP
// fragmentation-needed reply for the sending TCP stack to react to — an indefinite hang no
// testTimeout value can distinguish from an application genuinely taking that long. Fixing the
// path MTU (this session's own resolution) removes the hang itself; 120000ms stays as real headroom
// for a from-scratch replay of every script this project holds today, a bound worth keeping
// independent of any one developer's own network path, and unaffected by the internal-deadline
// reasoning above.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/vitest-global-setup.ts'],
    fileParallelism: false,
    testTimeout: 120000,
  },
});
