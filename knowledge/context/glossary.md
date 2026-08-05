---
title: Glossary
summary: The closed vocabularies and the registry of concepts that every other context speaks.
rationale: The material calls the glossary the Published Language of the whole system, and the contract has no published-language pattern, so the analysis records it as an open host service the other three consume.
sources:
  - intake/arquitetura-troubleshooting-v5.md
relationships:
  - with: knowledge
    pattern: open-host-service
    role: upstream
  - with: investigation
    pattern: open-host-service
    role: upstream
  - with: integration
    pattern: open-host-service
    role: upstream
gaps:
  - field: strategic
    why: The material classifies three subdomains — curated knowledge, execution, and access to corporate systems — and does not say where the glossary sits among them.
---

## What it is

The glossary holds four closed vocabularies — the types of subject an investigation can have, the outcomes a case can reach, the actions a recipient can take, and the recipients themselves — together with the concepts a case may collect.
It is pure data with no behaviour, and it is what keeps a concept named once rather than once per context.
The integration context translates into this vocabulary and not into the knowledge context's, which is what makes its normaliser an anticorruption layer rather than a passthrough.

## Rules

A term a case names must already exist here, or the case cannot be published.
The four vocabularies have different natures and grow differently, so treating them alike is an error.
