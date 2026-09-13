---
target: frontend
title: Credential placeholder readiness statement
summary: Adds a pure service and a sibling view that name every ${credential:<name>} the
  Configuration field's well-formed content embeds, state it resolves server-side at a test or an
  observation, and say nothing on this surface checks it, wired into the form fields alongside
  the other readiness statements.
task: sha256:6f062b59bd2f6d6ca7c9f7d334af73771ece68b6959b44943ff9fb46097dee12
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/configuration-readiness-credential-placeholder-statement-build
files:
- path: src/services/connector-configuration-credential-placeholder-statements.ts
  effect: New pure service exporting computeCredentialPlaceholderStatements(configurationText) ->
    readonly string[]. Parses the text as a JSON object (returning [] when it is not well-formed
    object text), recursively walks every string value the object reaches, and returns the
    distinct ${credential:<name>} names found, in first-occurrence order.
- path: src/services/connector-configuration-messages.ts
  effect: Adds CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING and credentialPlaceholderStatementText(name),
    a pt-BR sentence naming the credential, stating it resolves from the server's own
    configuration at the moment of a test or an observation, and that nothing on this surface
    checks it.
- path: src/routes/connector-configuration-credential-placeholder-statements-view.tsx
  effect: New sibling view component CredentialPlaceholderStatements({ credentialNames }) --
    returns null when credentialNames is empty, otherwise a heading plus one <li> per name.
- path: src/routes/connector-configuration-form-fields.tsx
  effect: Computes credentialPlaceholderStatements via a useMemo keyed on configuration.value and
    renders <CredentialPlaceholderStatements /> immediately after <SubjectPlaceholderStatements />.
    Save's disabled condition is untouched.
criteria:
- criterion: Each ${credential:<name>} the field's well-formed content embeds is named by the
    statement.
  met: true
  how: computeCredentialPlaceholderStatements walks the parsed configuration for every
    ${credential:<name>} occurrence and returns one entry per distinct name; the view renders one
    <li> per name.
- criterion: The statement says the credential is resolved from the server's own configuration at
    the moment of a test or an observation.
  met: true
  how: credentialPlaceholderStatementText's sentence states the credential is resolved server-side
    at a test or an observation.
- criterion: The statement says the credential is checked by nothing on this surface.
  met: true
  how: The same sentence closes stating nothing on this surface checks it.
- criterion: No statement on the surface reports a result of having checked whether a credential
    placeholder resolves.
  met: true
  how: No resolution-check result, status, or outcome was added anywhere -- the service only
    extracts names from well-formed text and never evaluates resolution.
nodes:
- node: rules/integration/a-connector-configuration-surface-promises-no-check-of-a-credential-placeholders-resolution
  encoded_at:
  - src/services/connector-configuration-credential-placeholder-statements.ts
  - src/services/connector-configuration-messages.ts
  - src/routes/connector-configuration-credential-placeholder-statements-view.tsx
  how: The rule's exact statement is what credentialPlaceholderStatementText states, one entry per
    distinct name the service extracts.
- node: rules/integration/a-connector-configuration-surfaces-readiness-statements-carry-no-claim-no-rule-decides
  how: Honored by omission -- no gate, disable, or unreadiness was added anywhere because a
    credential placeholder is present.
inferences:
- inferred: computeCredentialPlaceholderStatements returns a plain readonly string[] of distinct
    credential names rather than a richer discriminated-union shape.
  from: The task's own guidance to keep it simple since there is only one kind of statement.
- inferred: All three required facts (name, server-side resolution, checked by nothing here) are
    folded into a single sentence per credential name rather than three separate list items.
  from: The rule's own statement phrases all three as one continuous clause.
- inferred: The credential-extraction regex and object-walk are a local duplicate of the same
    minimal logic in the http-departures and subject-placeholder-statements services.
  from: The task's explicit instruction to duplicate the minimal logic rather than modifying
    those files' public contracts.
preserved:
- connector-configuration-form-fields.tsx's Save button disabled condition is unchanged -- no
  gate was added for a present credential placeholder.
- The Configuration Helper, draft-request gate, apply-confirmation diff, stale-draft marking,
  configuration-entry-guidance list, http-departure-statements service/view, and
  subject-placeholder-statements service/hook/view are all untouched.
deferred:
- what: connector-configuration-form-fields.tsx now sits at exactly 300 raw lines after this
    wiring.
  why: The build's own max-lines rule (skipBlankLines) passed at this length; no criterion of
    this task calls for a further split.
---

## What it is
The named gap in a panel that states everything else it can judge.

## Notes
Build round 1 green on the first attempt.
