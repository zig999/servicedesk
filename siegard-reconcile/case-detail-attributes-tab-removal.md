---
contract_version: siegard-reconcile/3
title: Case Detail's Attributes tab withdrawal
summary: 'Three tasks under initiative case-detail-attributes-tab-removal: unwire-attributes-tab-from-case-detail
  (removes the Attributes tab''s wiring from Case Detail''s tab strip), versions-panel-states-a-current-version-that-does-not-read-back
  (relocates the case-not-valid disclosure onto the Versions panel), and remove-attributes-tab-modules
  (deletes the now-orphaned tab component, its hook, and their dedicated tests).'
target: frontend
files:
- path: src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
  change: written by the delivery of task/case-detail-attributes-tab/remove-attributes-tab-modules
- path: src/hooks/use-case-current-version-validity.spec.ts
  change: written by the delivery of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/hooks/use-case-current-version-validity.ts
  change: new hook composing the shared useCaseVersions hook with a per-version GET against the highest-numbered
    version among those the case currently holds; classifies the outcome via the shared errorStateKind
    classifier into a discriminated union (pending, no-version, checking, not-valid, read-failed, valid)
    -- written by the delivery of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-attributes-tab-removed.spec.ts
  change: written by the delivery of task/case-detail-attributes-tab/remove-attributes-tab-modules
- path: src/routes/case-detail-screen-attributes-tab-removed.spec.ts
  change: written by the delivery of task/case-detail-attributes-tab/unwire-attributes-tab-from-case-detail
- path: src/routes/case-detail-screen-current-version-validity.spec.ts
  change: written by the delivery of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-detail-screen-manifest-action.spec.ts
  change: fetch stub extended with a per-version detail handler and one stale toHaveBeenCalledTimes(1)
    assertion corrected to 2 (pre-existing counts, both before and after the row click, falsified by the
    new per-version GET this delivery's versions-panel-states task legitimately adds) -- by the delivery
    of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-detail-screen-simulate-action.spec.ts
  change: same shape of correction as case-detail-screen-manifest-action.spec.ts -- by the delivery of
    task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-detail-screen-versions-retry.spec.ts
  change: fetch stub extended with a per-version detail handler; no assertion in this file needed correction
    -- by the delivery of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-detail-screen-view-released-action.spec.ts
  change: same shape of correction as case-detail-screen-manifest-action.spec.ts -- by the delivery of
    task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
- path: src/routes/case-detail-screen.tsx
  change: no longer imports CaseAttributesTab; its Tabs block renders exactly two TabsTrigger/TabsContent
    pairs (versions, hypotheses) instead of three -- by the delivery of task/case-detail-attributes-tab/unwire-attributes-tab-from-case-detail.
    VersionsPanel additionally calls useCaseCurrentVersionValidity(slug) and renders the current-version-does-not-read-back
    statement or the read-failed statement alongside the unchanged version-list table -- by the delivery
    of task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back
nodes:
- node: contracts/investigation/case-simulation
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow — the unconditional Simulate link, present\
    \ for every row regardless of version.state — <Button type=\"button\" variant=\"secondary\" asChild>\n\
    \  <Link to=\"/cases/$slug/versions/$version/simulate\" params={params}>\n    Simulate\n  </Link>\n\
    </Button>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: contracts/knowledge/case-query
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at VersionsPanel — the useCaseVersions(slug) call implementing
    list-case-versions — const { data, isLoading, isError, refetch } = useCaseVersions(slug);'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at the slug param threading the case identity through\
    \ the screen, and the New draft link implementing create-draft — const { slug } = useParams({ from:\
    \ \"/cases/$slug\" }); ... <Link to=\"/cases/$slug/versions/new\" params={{ slug }}>\n          New\
    \ draft\n        </Link>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at toRow — mapping a version's version and state into\
    \ the row shown — return {\n  id: version.version,\n  version: version.version,\n  state: STATE_CELL[version.state],\n\
    \  actions: actionsForRow(slug, version),\n};"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: domain/knowledge/case-version-state
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at STATE_CELL, keyed exactly by the enumeration's two\
    \ values — const STATE_CELL: Record<CaseVersionState, { color: string; label: string }> = {\n  draft:\
    \ { color: \"bg-warning\", label: \"Draft\" },\n  released: { color: \"bg-success\", label: \"Released\"\
    \ },\n};"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-has-at-most-one-draft
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at the hasDraft check gating the New draft link — const\
    \ hasDraft = data.data.some((version) => version.state === \"draft\");\n\n  return (\n    <>\n   \
    \   {!hasDraft && ("
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case
  conforms: true
  how: "src/hooks/use-case-current-version-validity.ts: held at the versionQuery.isError branch, lines\
    \ 48-51, together with the distinct pending/no-version/checking phases returned above it — if (versionQuery.isError)\
    \ {\n      return errorStateKind(versionQuery.error) === \"case-not-valid\"\n        ? { phase: \"\
    not-valid\", version: current.version }\n        : { phase: \"read-failed\", version: current.version\
    \ };\n    }\nsrc/routes/case-detail-screen.tsx: held at the not-valid and read-failed branches, checked\
    \ only once at least one version exists, each with its own distinct text — {currentVersion.phase ===\
    \ \"not-valid\" && (\n            <p>This case&apos;s current version does not read back as a case.</p>\n\
    \          )}\n          {currentVersion.phase === \"read-failed\" && (\n            <p>Unable to\
    \ load this case&apos;s version timeline.</p>\n          )}"
  encoded_at:
  - src/hooks/use-case-current-version-validity.ts
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at actionsForRow — the unconditional Manifest link, present\
    \ for every row regardless of version.state — <Button type=\"button\" variant=\"secondary\" asChild>\n\
    \  <Link to=\"/cases/$slug/versions/$version/manifest\" params={params}>\n    Manifest\n  </Link>\n\
    </Button>"
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: rules/knowledge/every-case-version-remains-readable
  conforms: true
  how: 'src/routes/case-detail-screen.tsx: held at rows built from the whole listing and rendered without
    narrowing — const rows = data.data.map((version) => toRow(slug, version)); ... <StatusTable columns={CASE_VERSIONS_COLUMNS}
    rows={rows} />'
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly
  conforms: true
  how: "src/routes/case-detail-screen.tsx: held at the rows.length === 0 branch — rows.length === 0 ?\
    \ (\n\n        <p>This case currently holds no version.</p>\n      ) : ("
  encoded_at:
  - src/routes/case-detail-screen.tsx
unbound:
- src/hooks/use-case-attributes-at-a-glance-removed.spec.ts
- src/hooks/use-case-current-version-validity.spec.ts
- src/routes/case-attributes-tab-removed.spec.ts
- src/routes/case-detail-screen-attributes-tab-removed.spec.ts
- src/routes/case-detail-screen-current-version-validity.spec.ts
- src/routes/case-detail-screen-manifest-action.spec.ts
- src/routes/case-detail-screen-simulate-action.spec.ts
- src/routes/case-detail-screen-versions-retry.spec.ts
- src/routes/case-detail-screen-view-released-action.spec.ts
notes: "Judged by 11 delegation(s), one per file; folded mechanically by trace.py --fold from the returns\
  \ under siegard-reconcile/case-detail-attributes-tab-removal.returns/.\nStaged by a review over files\
  \ a delivery wrote: no pair was omitted, so the delivery's own claims and every other binding of these\
  \ files were judged alike; the plan's node(s) rules/knowledge/a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case\
  \ were read on every file and answered for, and bound from nowhere here — a binding this record writes\
  \ is one the trace already held.\nA finding in src/hooks/use-case-current-version-validity.spec.ts names\
  \ rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, which no file of this\
  \ set is bound to: the errorResponse helper (lines 18-20) and its use to simulate the current version\
  \ failing validation, lines 52 and 74: function errorResponse(code: string, status = 422): Response\
  \ { ... }\n[versionPath(4)]: () => errorResponse(\"CaseNotValidError\"), — A reader trusting this test\
  \ as documentation of the read-refusal's shape learns HTTP 422 with error code CaseNotValidError for\
  \ a case version that fails validation at read; the specification's own decided answer is HTTP 409 reporting\
  \ CaseVersionNotValidError, so the two disagree on both the status and the name a caller would branch\
  \ on.. It blocks nothing here; it is owed a route of its own.\nA finding in src/routes/case-detail-screen-current-version-validity.spec.ts\
  \ names rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name, which no file\
  \ of this set is bound to: the errorResponse helper (lines 15-17) and its uses simulating a failing-validation\
  \ read, e.g. lines 28, 47, 63 and 151: function errorResponse(code: string, status = 422, details?:\
  \ unknown): Response {\n  return new Response(JSON.stringify({ error: { code, message: code, details\
  \ } }), { status });\n}\n...\n[versionDetailPath(2)]: () => errorResponse(\"CaseNotValidError\"), —\
  \ A reader trusting this test to encode the API's own wire contract learns that a current version failing\
  \ validation is signaled by HTTP 422 and error code CaseNotValidError; the node governing that read\
  \ fixes it as HTTP 409 reporting CaseVersionNotValidError, so the fixture teaches the wrong contract\
  \ to whoever next writes against it, and the mismatch is caught only if a real backend response is ever\
  \ compared against it.. It blocks nothing here; it is owed a route of its own.\nCandidates: 16 opened\
  \ across 5 of 11 delegation(s); each return lists its own under `candidates_opened`."
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/case-detail-attributes-tab-removal.returns/`, which are the evidence behind every entry above.
