---
target: frontend
title: Configuration Helper distinguishes an outstanding operations read from a document declaring none
summary: Two new operations-read disclosure states -- an outstanding read and a document declaring no
  operation -- are derived and rendered, each apart from one another and from every refusal.
task: sha256:30129630bf6fcbdf0e3e15b45c05a5b5baba831a34cf6cc73e5807f7dcefaebb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/drafted-answer-disclosure-operations-read-states-build-2
files:
- path: src/services/connector-configuration-operations-read-disclosure.ts
  effect: Adds two variants to OperationsReadDisclosureState -- "pending" (read outstanding) and
    "empty" (read answered with zero operations). operationsReadDisclosureStateForOutcome now maps the
    "pending" outcome to the new "pending" state, and the "operations" outcome to "empty" when its
    operations array is empty and "none" otherwise (unchanged for a non-empty array and for "idle").
    The three refusal branches and their messages are untouched.
- path: src/routes/connector-configuration-helper-fields.tsx
  effect: Adds two rendering branches for operationsReadDisclosure ahead of the existing "refused"
    branch -- "pending" renders "The named link's operations are being read..." and "empty" renders
    "The fetched document declares no operation.", both as a plain <p className="text-sm
    text-muted-foreground"> with no role="alert" and no destructive styling, so neither reads as the
    "refused" branch's role="alert"/text-destructive rendering that remains directly below them,
    unchanged. No other section of the file was touched.
criteria:
- criterion: While the read of the named link's operations has not answered, the surface states that
    those operations are being read.
  met: true
  how: The "pending" outcome maps to disclosure state { kind = "pending" }, rendered as "The named
    link's operations are being read...".
- criterion: Where that read answered with no operation, the surface states that the fetched document
    declares none.
  met: true
  how: The "operations" outcome with an empty operations array maps to { kind = "empty" }, rendered as
    "The fetched document declares no operation." A non-empty array still maps to { kind = "none" }.
- criterion: Those two statements are distinguishable from one another, neither presented as the other.
  met: true
  how: Distinct disclosure kinds ("pending" vs "empty") each carrying their own fixed,
    non-overlapping wording; the two conditions are mutually exclusive at the outcome level, so a
    render is never both at once.
- criterion: Each of those two statements is distinguishable from every refusal reading the operations
    read states, neither presented as one of them.
  met: true
  how: The three refusal messages are untouched and share no wording with the two new messages;
    visually, the two new states render as a plain <p> with no role="alert" and no text-destructive,
    apart from the role="alert"/text-destructive treatment reserved for "refused".
nodes:
- node: rules/integration/the-configuration-helper-states-an-operations-read-outstanding-and-a-document-declaring-no-operation
  encoded_at:
  - src/services/connector-configuration-operations-read-disclosure.ts
  - src/routes/connector-configuration-helper-fields.tsx
  how: Implemented in full for the two statements the invariant names, each apart from the other and
    from the three refusal messages the disclosure service already stated. The invariant's further
    clause -- apart from every refusal a-refused-operations-read-states-its-refusal-to-the-operator
    states -- is answered by leaving those three existing refusal branches and their wording
    untouched, per the task's own Notes that node is not among this task's candidates.
- node: domain/integration/openapi-document-operations
  how: Consumed as given via the existing "operations" outcome; this task adds no attribute to it and
    reads only whether its runtime array is empty to distinguish the "empty" disclosure state from
    "none".
- node: constraints/the-openapi-document-is-fetched-by-the-backend
  how: Honored by construction -- no new network call was added; the two new states are derived purely
    from the existing OpenApiDocumentOperationsReadOutcome the backend-backed hook already returns.
inferences:
- inferred: The exact wording of the two new messages.
  from: The invariant's own statement phrasing and the sibling refusal messages' register, kept plain
    English per the task's instruction that pt-BR is a separate task.
- inferred: The two new kinds are payload-less ("pending", "empty") rather than carrying a message
    field.
  from: The sibling DraftDisclosure type's own "pending" variant (no payload, fixed copy hardcoded at
    the render site) -- the convention this file's kind vocabulary already follows for a fixed,
    non-parameterized statement.
- inferred: Both new states render as plain <p> with no role="alert", matching the draft's own
    "pending" treatment rather than inventing new styling.
  from: Consistency with how this file already distinguishes different kinds of state elsewhere.
preserved:
- The three existing refusal kinds and messages in
  connector-configuration-operations-read-disclosure.ts, unchanged.
- The draft disclosure sections (Status readings, Response fields, Reading notes, Unresolved,
  Generated credentials, Method mismatch) and the draft-request gate, unchanged.
- The "idle" outcome still yields { kind = "none" } with no rendered statement, per the task's
  explicit exclusion of an idle-state message.
deferred:
- what: pt-BR wording for the two new messages.
  why: The task's own instruction states pt-BR wording is a separate sibling task's job; plain
    English strings used instead.
---

## What it is
The three situations that today leave the operator looking at the same empty listing -- waiting, a document with nothing in it, and a read that was refused -- held apart.

## Notes
Build round 1 failed lint: react/no-unescaped-entities on the apostrophe in "the named link's
operations". Fixed by escaping to `&apos;`. Build round 2 green.
