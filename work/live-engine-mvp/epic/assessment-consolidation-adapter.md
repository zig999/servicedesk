---
title: Assessment consolidation answers through a real LLM adapter
summary: A production Anthropic-backed implementation of the assessment-consolidator port, unchanged in shape from what already exists.
covers:
  - domain/investigation/assessment-consolidator
  - constraints/consolidation-runs-behind-a-port
  - constraints/the-consolidation-prompt-is-closed
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The port through which the assessment's text is produced gains a real, production adapter calling the Anthropic API.
Its own port needs no shape change, unlike judgment's.

## Notes

None.
