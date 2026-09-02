---
type: api
direction: published
operations:
  - create-draft
  - revise-hypothesis
  - place-hypothesis
  - remove-hypothesis
  - update-draft
  - release
  - discard
---

## Description

The curator's entrance now that no file is the medium: start a draft, revise a hypothesis, place it in (or remove it from) the draft's own manifest, correct the draft's own declared attributes, as many times as curation needs, then release — every validator rule answering together at that one moment, before the version stands immutable — or discard the draft instead, with nothing ever having been usable in its place.
Revising a hypothesis writes into that hypothesis's own highest existing revision, in place, for as long as no released case version has adopted it; once one has, revising instead creates the next revision — `rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased` holds the target, `rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft` still holds the draft it is checked against.
Written once is what makes release the one act that turns editing into a version nothing may still merge into — a release naming a slug and version that already exist is refused rather than merged, and revising a released case always starts the next draft.
