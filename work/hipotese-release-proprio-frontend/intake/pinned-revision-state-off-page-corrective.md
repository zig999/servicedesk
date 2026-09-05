Corrective increment.

Wrong behavior: a manifest entry's pinned-revision-state disclosure
(rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state) silently
disappears when the pinned revision falls off the default (unpaged) page its hypothesis's
revisions listing answers. Found by /review-change's conformance pass over
hipotese-release-proprio-frontend (delivery/hipotese-release-proprio-frontend/review/hipotese-release-proprio-frontend.md),
in three places: src/hooks/use-manifest-pinned-revision-states.ts (the hook computing each
entry's state, matching only against the unpaged first page a hypothesis's revisions listing
answers), src/routes/version-manifest-screen.tsx (RevisionSelect's own badge, built from the
same unpaged `revisions` array), and src/routes/case-version-editor-screen-view-released-manifest-state.spec.ts
(a test that fixes the silent drop as its own inference rather than a decided fact).

The rule states the disclosure is unconditional -- it names only three things it does not
depend on (the case version's own state, a release having been attempted, or the reader
opening the revision selector) -- and does not except a page that failed to carry the pinned
revision from that guarantee. A curator composing or reviewing a manifest currently loses
exactly the fact -- is this pin still in draft? -- the rule exists to keep visible, and only
discovers it via a later release refusal.

File the human is holding: frontend/app/src/hooks/use-manifest-pinned-revision-states.ts.

Source: delivery/hipotese-release-proprio-frontend/review/hipotese-release-proprio-frontend.md,
findings against rules/knowledge/a-presented-manifest-entry-states-its-pinned-revisions-state.
