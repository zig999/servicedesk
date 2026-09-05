---
title: Take the Attributes tab off Case Detail's tab strip
summary: The Case Detail screen's Tabs wiring reduced to Versions and Hypotheses, with the screen-level
  spec that asserted the third tab removed with it.
rationale: 'Cut from the module deletion because case-detail-screen.tsx is the tab component''s only consumer,
  and a task changing a consumer and the interface it consumes in one breath is two tasks; the scope named
  the affected files but deliberately left the cut open. It implements no specification node: rebinding
  it against a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case and a-presented-case-version-states-its-own-declared-attributes
  found neither clause reached by any criterion here — this task is a surface-composition change (which
  tab strip a screen offers) whose whole content the specification leaves to the interface, and the one
  disclosure this removal would otherwise drop is relocated by its own dependent task, not by this one.'
sources:
- work/case-detail-attributes-tab-removal/intake/scope.md
objective: The Case Detail screen at /cases/$slug offers no Attributes tab, and its Versions and Hypotheses
  tabs behave as they did.
criteria:
- Case Detail renders exactly two tab triggers, labelled Versions and Hypotheses.
- case-detail-screen.tsx renders no tab trigger with the value "attributes".
- case-detail-screen.tsx renders no tab content with the value "attributes".
- case-detail-screen.tsx imports nothing from routes/case-attributes-tab.
- Versions is the tab selected on Case Detail's first render.
- Selecting the Hypotheses tab on Case Detail mounts the hypotheses tab content.
- Selecting the Versions tab on Case Detail mounts the same version-listing panel it mounted before this
  task.
- No spec file in the tree asserts that Case Detail presents an Attributes tab.
- Every Case Detail spec other than the one asserting the Attributes tab passes without being edited.
---

## What it is
The tab strip in frontend/app/src/routes/case-detail-screen.tsx currently pairs a TabsTrigger value="attributes" with a TabsContent value="attributes" mounting CaseAttributesTab.
This task removes that trigger and that content together, along with the screen's import of the tab component.
frontend/app/src/routes/case-detail-screen-attributes-tab.spec.ts proves the tab strip presents the Attributes tab, so it goes with the wiring it proves.

## Notes
The inventory records that dropping only one half of the trigger/content pair breaks the Versions and Hypotheses tabs that remain, and names six sibling Case Detail specs as the consumers that would show it.
The tab component and its hook stay in the tree under this task and are removed under the task that depends on this one and on the relocation task below.
Rebinding against the specification confirmed this task implements nothing on its own: the case-not-valid disclosure that this removal would otherwise drop is relocated entirely by task/case-detail-attributes-tab/versions-panel-states-a-current-version-that-does-not-read-back, which depends on this task; taken alone, without that dependent, this task's own delivery would stand refused by a-case-keyed-surface-states-a-current-version-that-does-not-read-back-as-a-case, which is why that task exists in this epic.
Whether to delete frontend/app/src/hooks/use-case-attributes-at-a-glance.ts's validation-reading logic here or let the relocation task re-author its own version is an implementation choice; either is acceptable as long as the relocation task's own criteria are met before the deletion task runs.
