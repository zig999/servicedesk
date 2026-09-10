---
type: invariant
statement: >-
  Where an operator-facing screen presenting the connector configuration registered under
  one named connector holds an edit of that configuration the operator has composed and not
  submitted, the answer of a read of that same configuration arriving at that screen
  changes no field of it, the edit standing exactly as the operator left it until the
  operator states in a further, explicit act that it is to be replaced by the content that
  answer carries.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered
  under n through read-connector-configuration of
  contracts/integration/connector-configuration-registry, where the operator has changed
  one or more of s's fields away from the content of the read s is presenting and has
  submitted no register-connector call from s: the arrival at s of the answer of a further
  read of the configuration registered under n sets no field of s, so every field of s goes
  on holding exactly what the operator left in it and s presents no value of connector or
  configuration the operator did not put there; the fields hold the content that arriving
  answer carries only where the operator, having asked for it, states in a further act that
  the edit is to be replaced by it, and where the operator does not so state no field of s
  changes. Nothing here turns on whether the arriving answer differs from the content s was
  presenting, on which of s's fields the edit touched, on how much of the edit was made, or
  on how that further read came to be issued.
constrains:
- domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` can answer at this screen more than once over one connector name, and `a-connector-configuration-answer-already-held-stands-presented-while-a-further-read-is-outstanding` states what the screen presents while a further such read is outstanding while expressly leaving what it presents once that further read answers to be stated elsewhere.
Between the read the screen is presenting and a submission the operator holds an edit that exists on the screen and nowhere else — the condition `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` is written over — and no node stated what becomes of that edit when a further answer arrives.
Left unstated, an operator's unsubmitted work could vanish under an answer nobody asked to have written into the fields, on a screen that would look to them exactly as though they had never typed.

The edit stands, because it is the only content in the situation that cannot be got back.
An unsubmitted edit has entered no registry — `a-connector-configuration-is-tested-through-a-registered-capability` states that even a diagnostic exercises the configuration currently registered and never text an operator holds unsaved — so an edit overwritten is an edit gone, with no operation of this contract able to answer it back; the arriving answer, by contrast, is content the registry holds and a further read answers again for the asking.
Overwriting is worse than merely lossy here: `domain/integration/connector-configuration` is replaced whole on every edit, so an operator who does not notice that their partial change to a long opaque configuration was silently replaced may go on editing and submit content they did not intend over a write that is total.

The further, explicit act is the one `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` already states — the act that returns every field of the surface to the content of the registration the surface last read, taking effect only where the operator states in a further act that it is to be performed — and no second act is created here.
That rule already reads a costly act as the operator's own to state rather than something a surface infers, and `an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation` holds the same for total content arriving from a draft; an answer arriving from a read is the third way that field's whole content can be replaced, and it is the operator's to ask for on the same terms.

Nothing about the read's own presentation moves.
`a-presented-connector-configuration-states-an-outstanding-or-failed-read` states that where the read returned the screen presents connector and configuration as that answer carried them and states no value that answer did not carry, which fixes what the screen presents of the read; an edit the operator has themselves composed standing in those fields is neither a value of the read nor a presentation of one, exactly as `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` and `a-presented-connector-configuration-with-no-edit-offers-no-discard-and-no-submission` already have that screen holding fields changed away from the answer while standing in the returned reading.
Which reading the screen stands in, whether it states to the operator at all that a further read is under way, what it presents where that further read fails or is refused, and the well-formedness statement `a-connector-configuration-surface-judges-its-configuration-fields-content` owes from the field's content alone are each no part of this; which control carries anything, its wording and its placement stay the interface's own, exactly as every surface rule here leaves them.
An invariant over `domain/integration/connector-configuration`, immediate and inside that one aggregate — the home and shape every sibling fact about this surface already takes, a new rule rather than the api contract, which cannot declare a presentation, or the domain element, which declares what a configuration is and not what a screen does with an answer about one.
