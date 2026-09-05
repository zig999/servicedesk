# Scope

Corrective increment (one wrong behavior, human-named, in code already delivered).

Wrong behavior: `src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts` asserts that
`src/case/hypothesis-revision-release.port.ts` "declares no import at all" — a stricter rule than
`constraints/the-domain-depends-on-no-infrastructure` actually states (which forbids only
framework, driver and provider-client imports; infrastructure legitimately reaches the domain
through ports). Its sibling port test,
`src/__tests__/unit/case/hypothesis-revision-release-state.port.spec.ts`, already asserts the
correct, narrower rule (no driver/framework import, no provider-client import) for its own sibling
port, which legitimately imports a domain type
(`import type { HypothesisRevisionState } from './case-store.port.js';`). If
`hypothesis-revision-release.port.ts` ever legitimately needed a domain-internal type import (as
its sibling does), this test would wrongly fail it even though nothing in the specification
forbids that.

Found by `/review-change`'s specification-conformance pass over the `hipotese-release-proprio`
initiative (`delivery/hipotese-release-proprio/review/hipotese-release-proprio.md`, finding at
`src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts`).

File: `src/__tests__/unit/case/hypothesis-revision-release.port.spec.ts`

Correction, as the review already stated it: narrow the assertion (and its stated rationale) to
check for the absence of framework, driver or provider-client imports specifically — matching
`constraints/the-domain-depends-on-no-infrastructure` — rather than the absence of any import at
all, mirroring the sibling test's own already-correct pattern.

Note on this file's own trace history: `trace.py --encodes` reports no existing binding for this
exact file — it has only ever been written as a test, never listed under any implementation
record's own `encoded_at`. This project's own precedent
(`case-fixture-reads-clean-collects-delete-corrective`, delivered before this session) already
established that a corrective task may be the first delivery to bind a test file the trace did not
previously know, when the fix genuinely answers to a specification node governing that file's own
content.

Project root: `/home/siegfriedneto/projects/servicedeskn1/.claude/worktrees/hipotese-release-proprio`
Target: backend
Initiative slug: `hypothesis-revision-release-port-test-corrective` (new slug —
`work/hipotese-release-proprio` holds `closure.md` and is closed)
