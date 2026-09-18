---
type: policy
statement: >-
  A surface addressed by a capability's own name and version that submits a registration to
  the capability registry states to the operator that the registration was made as soon as
  the registry answers that write, and withholds that statement for no subsequent
  read-capability-by-identity of the registered capability that surface issues, the
  statement standing alike while such a read is outstanding, once it has answered and where
  it failed.
expression: >-
  For an operator submitting a registration r through register-capability of
  contracts/integration/capability-registry from a surface s addressed by the name n and
  the version v that r carries, and the moment m at which the registry's answer that r
  registered reaches s: the registered outcome
  a-submitted-registration-states-its-outcome-to-the-operator owes stands at s from m. It
  stands from m whether or not s issues a further read-capability-by-identity of (n, v),
  and whatever the state of such a read: that read being outstanding neither delays it nor
  withholds it, that read answering neither brings it forward nor changes what it names,
  and that read failing neither withdraws it nor converts it into a statement that the
  registration was not made. Nothing here is stated of a submission the registry refused or
  has not answered, those staying
  a-submitted-registration-states-its-outcome-to-the-operator's and
  a-registration-outcome-is-never-stated-before-the-registry-answers's own; and this
  carries no capability attribute into that statement, what s presents of the declared
  attributes standing at (n, v) staying
  a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's own,
  drawn from that identity read's own answer and from no other.
constrains:
  - domain/integration/capability
consistency: eventual
---

## Description

`register-capability` of `contracts/integration/capability-registry` is submitted from a surface addressed by the very identity it writes: `a-successful-capability-registration-lands-on-the-capabilitys-own-surface` lands every successful submission on the surface `read-capability-by-identity` answers, and an operator editing a standing registration is on that surface before they submit at all.
Such a surface therefore has a read of its own over the identity it just wrote, and `a-submitted-registration-states-its-outcome-to-the-operator` fixes only the lower bound of when the outcome reaches the operator — `a-registration-outcome-is-never-stated-before-the-registry-answers` holding that neither outcome is stated of a submission the registry has not answered — while saying nothing about an upper one.
So whether the operator learns their registration was made at the registry's own answer, or only once the surface had read the identity back, fell to whatever a surface happened to render.

The registry's answer is the moment, because it is the moment the fact being stated becomes true and the whole reason the statement is owed.
`a-submitted-registration-states-its-outcome-to-the-operator`'s own reasoning is that both writes are create-or-replace and total, so a surface that looks after the submission exactly as it looked before it leaves the operator unable to tell a registration made from one that never left — and an interval in which the registry has registered and the surface still says nothing is precisely that surface.
The hazard that reasoning names is live in it: an operator who is told nothing resubmits, and a second `register-capability` at the same identity is a replacement of what was just registered rather than the creation they believe they are making, the same hazard that rule's neighbour raises against leaving an operator on the authoring surface.

Binding the statement to the identity read would make a read's answer speak for a write's.
`a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` states two windows in which that read has not settled, and a read that fails leaves the surface stating that the capability could not be read; an operator who had just registered successfully would then meet a surface saying only that, which reads exactly like a registration that did not take.
That is the two-situations-reading-alike presentation this specification has refused wherever it has met it, and it is worse here than in the windows that rule covers, because the remedy differs in kind: a failed read is worth issuing again and that rule offers the act, while `a-registration-outcome-is-never-stated-before-the-registry-answers` records that a write repeated is a second write and never a recovery of the first, so an operator left uncertain about the write has no act that resolves it and the one act the surface offers them resolves the wrong call.

Withholding what the surface already knows is the harm the sibling registry's own further-read rule refuses in terms.
`a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` puts a screen holding an answer in the reading that answer belongs to rather than in the unsettled one, on the reasoning that the outstanding window exists for an interval in which nothing is known and that withholding puts a blank where the registry answered.
A surface holding the registry's answer to its own write is in that position exactly: nothing about the outcome is unknown to it, so the premise for saying nothing is absent.

Nothing here moves what the surface presents.
`a-presented-capability-states-its-declared-attributes-as-the-read-answered-them` fixes every declared attribute of the presented identity to that read's own answer and expressly refuses the content a `register-capability` submission carried as a source for any of them, and this states none of those attributes: the outcome statement names that the registration was made and the name and version the submission carried, which `a-submitted-registration-states-its-outcome-to-the-operator` already fixes as its content, and names no nature, schema, timeout, connector, concept or payload notes at all.
Stating the outcome at the registry's answer therefore puts no submitted value into the presentation, and a surface that satisfies both rules states the outcome at once while still presenting only what its identity read answers.

Nothing else about the interval is decided here.
Whether such a surface issues a further identity read at all, what it presents while one is outstanding, and what becomes of an edit it holds are stated by no node and are not stated by this one; the refused outcome and the unrecognised-refusal branch stay `a-submitted-registration-states-its-outcome-to-the-operator`'s, the bound against stating an outcome early stays `a-registration-outcome-is-never-stated-before-the-registry-answers`'s, and where the operator lands stays `a-successful-capability-registration-lands-on-the-capabilitys-own-surface`'s.
No call is refused, no attribute is added to `domain/integration/capability`, and no operation is published.
Which control carries the statement, its wording, where it sits and how long it stands are form and belong to the interface, exactly as every other surface rule of this specification leaves them.

Home is a new rule rather than `a-submitted-registration-states-its-outcome-to-the-operator` itself, whose statement is written once for both registries and whose Description records that pairing deliberately: the capability surface is the one of the two whose further-read behaviour this specification has not stated, the sibling screen's further-read readings being decided in rules of their own, so folding this into the shared node would state for the connector configuration registry a fact this decision did not weigh.
A policy over `domain/integration/capability` at eventual consistency, the shape and reasoning both neighbours over this same surface already take: the surface never performs the write it reports, so what it states settles only when a call issued separately to the registry settles.
