# Capability detail screen — layout adjustment

## Requested change

On the capability detail screen (route `/capabilities/$name/$version`, e.g.
`http://localhost:5173/capabilities/perfil-mobile-tecnico-reader/1.0.0`), rendered by
`CapabilityFormFields` in `frontend/app/src/routes/capability-form-fields.tsx`:

1. Move the "Nature" field into the same row as "Name" and "Version", so the three sit in one row
   of three columns. Today Name and Version share a `flex gap-4` row (`capability-form-fields.tsx`
   lines 130–166); Nature sits in its own `FormField` outside that div, on its own row below.

2. Increase the height of the input-schema and output-schema editors by 25%. Both are the shared
   `JsonTextareaField` component at `frontend/app/src/shared/components/json-textarea-field.tsx`
   (line 150), whose `Textarea` currently carries `min-h-40` (10rem/160px). +25% is 12.5rem/200px,
   which is not a stock Tailwind step, so it needs an arbitrary-value class such as
   `min-h-[12.5rem]` (or an equivalent yielding exactly 200px, whichever this project's own
   Tailwind conventions prefer).

## Why this is surface, not a fact of the business

Nature, Name, Version, input schema and output schema are all already displayed on this screen
today, for the same capability identity, telling the same facts they already tell — only their
arrangement and the schema boxes' height change. No status, no wording, no visibility rule, and no
field that exists today stops existing or starts existing; nothing new is shown or learned, and
nothing a person could do before stops or starts being possible. This project's own routing rule
(`Which route a change takes`) reserves `edits_freely` direct edits for exactly this shape of
change, but `siegard.json` declares no `edits_freely` target — so this goes through the ordinary
`/plan-work` → `/implement-task` → `/review-change` route for "a capability's surface... the
specification already sustains," not the corrective-increment route (nothing here is a wrong
behavior in delivered code) and not `/analyse` (nothing here is a fact of the business).

## Human authorization

The human who asked for this layout change reviewed and approved routing it this way before this
scope was written.
