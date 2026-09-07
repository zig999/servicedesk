---
type: policy
statement: >-
  A surface presenting to an operator the one capability registered at a name and version that
  operator named states explicitly, while the read of that identity has not yet answered, that
  the capability at that name and version is still being read, and states explicitly, where
  that read fails to answer, that the capability at that name and version could not be read;
  in neither window does it present any attribute of any capability as the content standing at
  that identity, a capability read and shown and the two windows are told apart from one
  another, and in the failed window alone the surface offers the operator a control that
  issues the same read for the same identity again — a reattempt the surface never makes on
  its own.
expression: >-
  For a name n and a version v an operator named, and a surface presenting the capability
  registered at (n, v): while the read of (n, v) has not returned, the surface states that the
  capability at (n, v) is still being read. Where that read returns nothing, or returns
  something the surface cannot read as the capability at (n, v) — the registry's own refusal
  of an identity no capability is currently registered at excepted, that refusal being its own
  answer and not this window — the surface states that the capability at (n, v) could not be
  read, and carries a control whose one effect is to issue the read of (n, v) again. In
  neither window is any attribute of any capability — its nature, input schema, output schema,
  timeout, connector or concept — presented as the content standing at (n, v). The three
  presentations, a capability read and shown, a read still outstanding and a read that failed,
  are distinguishable from one another to the operator, and none of them is presented as
  another. The reattempt control stands in the failed presentation and in neither of the other
  two, and the read is issued again only on the operator's own act.
constrains:
  - domain/integration/capability
consistency: eventual
---

## Description

`read-capability-by-identity` of `contracts/integration/capability-registry` is the read this surface is addressed by — the identity-keyed read added exactly so a screen naming a capability by its own name and version loads directly on first navigation or a refresh.
That read is issued separately from the surface that presents it, so between the operator naming the identity and the answer arriving there is a window in which the surface holds no registration to show, and a read that fails leaves it with none at all.

A blank in either window is the silence this specification has refused wherever it has met it.
`a-presented-manifest-entry-states-its-pinned-revisions-state` states the outstanding read and the failed read on the entry itself, in their own right, for exactly this reason, and `a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case` holds three readings of one surface apart because they ask different acts of the reader who meets them.
Here the acts differ the same way: an outstanding read resolves on its own and is worth waiting for, a failed read is worth attempting again, and a registration read is what the operator inspects or edits.
A surface showing nothing while the read is outstanding reads like a capability whose contract declares nothing, which `a-capability-declares-its-contract` says the registry never holds; a surface showing nothing after a failure reads like an identity nothing is registered at, which is the registry's own distinct answer under `the-capability-identity-read-refuses-an-unregistered-identity`.

No attribute accompanies either statement, because there is nothing partial to honestly present: a registration answers whole, every required attribute declared or the registration refused, so a nature, schema, timeout or connector shown beside "still being read" or "could not be read" would state as this identity's content a declaration nobody read — the substitution `a-manifest-entrys-pinned-revision-is-always-shown` refuses for a pin.

The reattempt is offered because this specification already names retrying as the act a failed read asks of its reader, and telling an operator the read failed while leaving the retry to a page reload or a re-navigation names the act and withholds it.
It is the operator's own act and never the surface's: `the-capability-identity-read-is-rate-limited` holds this one route to sixty requests a minute from one source address, a limit written against an unbounded loop, and a surface re-issuing the read on its own is that loop — a deliberate reattempt, one per operator act, sits nowhere near the limit.
The control stands in the failed window alone because an outstanding read has nothing to reattempt and a registration already shown has nothing to recover.

Nothing here moves what the registry answers.
The refusal of an unregistered identity and the refusal past the rate limit stay that route's own, and this states only what the operator is told around them; a read refused past the limit answered nothing and so stands in the failed window, while a read that answered that no capability is registered at the identity answered, and is not that window.
Which control carries each statement, its wording, and where on the surface it sits are form and belong to the interface, as this specification's other surface rules leave them.

Consistency is eventual because the surface never holds the registration it presents: what it states is drawn from a read of the capability issued separately, and the two windows this rule states are precisely the interval in which that read has not settled.
