# Product

## Register

product

## Users

Internal curators and engineers who author and maintain the data the diagnosis service runs
against: troubleshooting cases (hypotheses, evidence criteria, resolutions), capabilities
(external system observation contracts), connector configurations, and glossary concepts. They
work inside dense forms — JSON schemas, connector configs, ordered hypothesis lists — often for
long stretches at a desk, and the records they save can change what the production diagnosis
service tells a real support agent about a real case. Mistakes here are not cosmetic; a malformed
schema or a mis-ordered hypothesis changes what the service concludes.

## Product Purpose

`case-authoring-console` is the internal authoring tool for ServiceDeskN1's diagnosis service (see
README.md): a backend that resolves one troubleshooting case at a time by judging ordered
hypotheses against collected evidence. The console is where that knowledge — cases, capabilities,
connectors, glossary concepts — gets curated, versioned, and released, without touching the
service's code. Success looks like: an operator can find the record they need, understand its
current shape at a glance, edit it with confidence, and trust that what they saved is exactly what
gets released — no silent invalid state, no ambiguity about what changed.

## Brand Personality

Precise and technical. The voice is direct and confident, the way a well-written internal tool
talks to the people who live in it all day: no persuasion, no marketing gloss, no softened
wording. Density is a feature, not a flaw, for the audience it serves — but density is never an
excuse for unclear hierarchy: what matters most in a given form should still read as what matters
most.

## Anti-references

- Generic consumer SaaS admin panels: colorful stat cards, gradient accents, cheerful
  onboarding-style copy. This tool is not selling itself to its users.
- Flattening every field to the same visual weight "for consistency" — the console's own domain
  has fields that matter more than others (e.g. which concept a capability observes), and the
  layout should say so.
- Anything that fights or duplicates the TUI component system (`frontend/tui`) instead of
  extending it.

## Design Principles

- **Respect the TUI system.** Every screen composes `frontend/tui`'s shared components
  (`@tui/ui/*`) and this app's own `design-system/tokens.css`; new patterns extend that system
  rather than forking it.
- **Hierarchy follows the domain, not just the grid.** A form's visual weight should reflect which
  field is load-bearing for that record, not just alternate for rhythm's sake.
- **Density with legible structure.** These are power users doing precise, repetitive work; don't
  pad the layout, but group and separate fields so the structure is scannable at a glance.
- **Validation is first-class.** Invalid state (a malformed schema, an unconfirmed destructive
  action) is always visible before it can cause a production-affecting mistake.
- **Precision over persuasion.** No marketing tone, ever — labels and copy say exactly what will
  happen.

## Accessibility & Inclusion

Standard WCAG AA: contrast, keyboard navigation, and screen-reader labelling held to the usual
bar. No requirement stated beyond that.
