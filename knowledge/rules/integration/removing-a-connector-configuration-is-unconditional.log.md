---
entries:
- field: type
  unstated: The material states connector removal is unconditional without naming which rule subtype records an absence of guard.
  decided: invariant
  why: The claim constrains domain/integration/connector-configuration alone, inside its own aggregate, with nothing to cross — the same subtype every other single-aggregate rule in this specification already uses.
- field: statement
  unstated: What remove-connector answers when asked to remove a connector configuration by a name under which nothing is currently registered — the standing statement made removal unconditional only with respect to whether a capability names the connector, leaving whether the name's own emptiness is checked, and what a refusal for it would report, stated by no node.
  decided: The removal completes with no effect on the registry — never refused for the name's absence, every registered configuration left exactly as it stood, answered exactly as a removal that removed one, and no error value named for the case.
  why: The registry holds a configuration by name and nothing else resolves that name, so the only thing such a removal could check is whether the name currently holds something, and the state a refusal would report is precisely the state the removal was issued to produce — a refusal would therefore report success as an error, give the caller no act to take in response, and make a name nothing was ever registered under indistinguishable in consequence from one an earlier removal already emptied.
---
