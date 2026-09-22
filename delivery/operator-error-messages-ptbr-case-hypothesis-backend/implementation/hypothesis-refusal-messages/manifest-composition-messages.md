---
target: backend
title: PT-br messages for the three refusals a case version's manifest raises
summary: HypothesisNotInManifestError, ManifestPositionOccupiedError and ManifestWouldHoldNoHypothesisError
  now build their message in Brazilian Portuguese, naming the case, the version and, where the English
  original did, the hypothesis or the position, with context, name and status-map untouched.
task: sha256:970fa93d8f966f5fc9e48df6010b1f2405e7c8c3dd39199e62223711b03b407d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/hypothesis-refusal-messages-manifest-composition-messages-build
files:
- path: src/errors/hypothesis-not-in-manifest.error.ts
  effect: The super() message is rewritten in PT-br, naming the hypothesis, case slug and version; constructor
    signature, context and error.name are untouched.
- path: src/errors/manifest-position-occupied.error.ts
  effect: The super() message is rewritten in PT-br, naming slug, version and occupied position, and stating
    a manifest position is unique within its case version; constructor signature, context and error.name
    are untouched.
- path: src/errors/manifest-would-hold-no-hypothesis.error.ts
  effect: The super() message is rewritten in PT-br, naming slug and version, and stating the removal
    would leave the manifest holding no hypothesis and that a manifest declares at least one entry; constructor
    signature, context and error.name are untouched.
criteria:
- criterion: HypothesisNotInManifestError's message is in PT-br and names the hypothesis, the case slug
    and the version number whose manifest does not hold it.
  met: true
  how: The rewritten message interpolates hypothesis, slug and version in a PT-br sentence.
- criterion: ManifestPositionOccupiedError's message is in PT-br, names the case slug, the version number
    and the occupied position, and states that a manifest position is unique within its case version.
  met: true
  how: The message interpolates slug, version and position, and states "uma posição do manifesto é única
    dentro da sua versão do caso".
- criterion: ManifestWouldHoldNoHypothesisError's message is in PT-br, names the case slug and the version
    number, and states that removing the entry would leave that manifest holding no hypothesis and that
    a manifest declares at least one entry.
  met: true
  how: The message interpolates slug and version, states the removal leaves the manifest "sem nenhuma
    hipótese", and states a manifest "declara ao menos uma entrada".
- criterion: The three messages are distinguishable from one another by their text alone, so an operator
    reading one can tell which of the three conditions occurred.
  met: true
  how: Each message describes a different condition in its own wording, with no shared sentence between
    any two.
- criterion: The three messages name the case and the version in the same order and with the same PT-br
    wording as one another.
  met: true
  how: All three use the identical fixed phrase `caso "..." versão ...`.
- criterion: No message states a fact its English original did not state, and every interpolated value
    in each PT-br message also appeared in that class's English message.
  met: true
  how: Each PT-br message is a translation with no clause added, and the interpolated values match the
    English originals' sets exactly.
- criterion: Each message uses "caso" for a case, "versão" for a case version, "hipótese" for a hypothesis,
    "manifesto" for a manifest and "posição" for a manifest position, and uses no English domain noun.
  met: true
  how: All three messages use exactly these five words wherever the concept is named, and contain no English
    domain noun.
- criterion: Each of the three classes' name property still holds its unchanged class-name string.
  met: true
  how: The this.name assignment in each constructor is untouched.
- criterion: src/src/errors/status-map.ts is unchanged and still maps each of the three classes to the
    HTTP status it mapped to before.
  met: true
  how: status-map.ts was not opened for edit; its existing entries (404/409/422) stand as read.
- criterion: Each of the three classes' context property holds exactly the properties and values it held
    before, with no value moved into or out of it.
  met: true
  how: Only the string literal inside each super(...) call was edited; this.context is unchanged in every
    file.
- criterion: The suite under src/src/__tests__ passes with no test file changed.
  met: true
  how: A search of the whole src/src/__tests__ tree found no test asserting a literal fragment of any
    of the three messages; no test file was changed. The captured build's test-unit step passed.
nodes:
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  encoded_at:
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/status-map.ts
  how: The node's fact was already encoded by the class name and status-map.ts's mapping, both untouched;
    this task rewrites the message text into PT-br.
- node: rules/knowledge/a-hypothesis-position-is-unique-within-its-case
  encoded_at:
  - src/errors/manifest-position-occupied.error.ts
  - src/errors/status-map.ts
  how: The identity fact was already encoded by the class name and the unchanged status-map.ts entry;
    this task rewrites the message into PT-br.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
  - src/errors/status-map.ts
  how: The identity fact was already encoded by the class name and the unchanged status-map.ts entry;
    this task rewrites the message into PT-br.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  encoded_at:
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/manifest-position-occupied.error.ts
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
  how: All three classes' message text is now written in Brazilian Portuguese.
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  encoded_at:
  - src/errors/hypothesis-not-in-manifest.error.ts
  - src/errors/manifest-position-occupied.error.ts
  - src/errors/manifest-would-hold-no-hypothesis.error.ts
  how: Every occurrence of case/case-version/hypothesis/manifest/manifest-position uses the fixed word;
    no English word for any of the nine fixed nouns appears.
inferences:
- inferred: The word "entrada" for "entry" is a free translation rather than a fixed vocabulary word.
  from: the vocabulary constraint fixes nine nouns and 'manifest entry' as a whole is not among them;
    only its position is.
- inferred: The fixed phrase order `caso "..." versão ...` (case immediately before version, no connecting
    preposition) is used identically in all three messages.
  from: the distinguishability/shared-wording criterion, and the sibling case-not-found.error.ts translation's
    convention.
preserved:
- error.name for all three classes.
- the context field's shape and values for all three classes.
- status-map.ts, left unopened -- the 404/409/422 mapping for the three classes.
- every test file under src/src/__tests__, none of which was modified.
deferred:
- what: Enforcing that no two manifest entries of one case version share a position, and that a remove-hypothesis
    leaving the manifest empty is refused before the write.
  why: REMAINDER note on this task -- that enforcement belongs to the already-delivered place-hypothesis/remove-hypothesis
    act.
- what: The frontend manifest surface's own wording for two of these three refusals.
  why: ADVISORY note on this task -- governed by a-manifest-surface-names-the-composing-refusals-it-holds-a-presentation-for,
    outside this epic's covers.
---
## What it is
The three refusals whose subject is what a case version's manifest holds, rewritten whole in
Brazilian Portuguese, sharing an identical case/version opening.

## Notes
None.
