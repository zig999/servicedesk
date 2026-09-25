Wrong behavior observed: the Output schema field's authoring surface, on both the capability
create screen and the capability detail screen, shows no guidance paragraph at all beside the
Output schema field.

Reproduction: capability-form-fields-output-schema-guidance.spec.ts (already in the repo,
pre-existing, failing) locates the guidance through its own findGuidanceParagraph(document.body)
helper and expects a guidance paragraph stating:

1. that the read field names are the paths through the schema's own top-level properties object
   and every properties/items schema reachable beneath it;
2. how such a path is built (an object's own key joined onto its parent's path with a dot, an
   array's own items joined onto its parent's path with brackets);
3. that what is entered is JSON;
4. that a reached node's own type and description, where declared, are read as that field's
   declared semantics;
5. that no other content of the entered schema is read or validated;
6. that a description entered there states meaning only and names no decision;
7. that the same guidance text renders identically beside the Output schema field on both the
   capability create screen and the capability detail screen.

Currently `guidance` is null/absent on both screens, so all 8 assertions in that spec file fail
(TypeError or AssertionError on an undefined/empty guidance element).

File: frontend/app/src/routes/capability-form-fields.tsx
