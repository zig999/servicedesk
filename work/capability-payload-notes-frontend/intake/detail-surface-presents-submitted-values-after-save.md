# Scope — corrective increment

Wrong behavior: use-capability-detail.ts's mutation onSuccess callback receives the
registry's own PUT response as `_data` and discards it unused; it then resets the form and
both schema baselines from `values` (the content the submission itself carried) rather than
from the registry's answer. Until the invalidated ["capability", name, version] query
refetches, the capability detail surface presents exactly the submission the operator just
sent, not a confirmed read — contradicting
rules/integration/a-presented-capability-states-its-declared-attributes-as-the-read-answered-them's
requirement that a presented attribute states what a read-capability-by-identity answer
carried, "never... the content a register-capability submission carried."

Reproduction: save an edit on the capability detail surface; before the invalidated query's
refetch completes, the fields on screen already show the submitted values rather than a value
the registry has confirmed it actually holds.

File: src/hooks/use-capability-detail.ts
