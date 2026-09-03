Corrective increment.

Wrong behavior, observed by running the delivered system: on the case detail screen's hypothesis
revision history (`frontend/app/src/routes/hypothesis-revision-history.tsx`), the "current"
revision shown for a hypothesis is computed as the highest revision number that hypothesis has
ever held across its whole history (`Math.max(...revisions.map((revision) => revision.revision))`),
never read from any case version's manifest. This contradicts
rules/knowledge/a-manifest-entrys-pinned-revision-is-always-shown, which states that a manifest
entry's pinned revision is the entry's own reference, never recovered from any listing of the
hypothesis's revisions. Concretely: the human pinned the draft case version (case
perfil-mobile-tecnico-probe, version 2) to revision 2 of hypothesis push-desabilitado via the
manifest builder, but this screen still labels revision 4 (the hypothesis's own highest-ever
revision) as "current" and revision 2 as "frozen" — the reverse of what that version's manifest
actually pins. A second effect: the "Revise ->" action is only rendered on the row this screen
calls current, so a curator cannot reach the revise screen for the revision a version's manifest
is actually using when it differs from the highest.

The wrong behavior: "current" must be read from the target case version's own manifest entry for
that hypothesis (the revision it pins), not from the hypothesis's own highest revision number.

The file it lives in: frontend/app/src/routes/hypothesis-revision-history.tsx

Project root: /home/siegfriedneto/projects/servicedeskn1
Initiative slug: hypothesis-revision-editable-until-published-frontend (the only live frontend
work root; this screen's own delivering initiative, manifest-revision-repin, is closed)
