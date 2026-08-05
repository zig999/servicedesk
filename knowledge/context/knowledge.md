---
title: Curated Knowledge
summary: The cases a specialist writes — which hypotheses a reported problem has, what confirms each one, and which one dominates which.
strategic: core
rationale: The material draws the case's dependency on the capability registry only as a check performed when publishing, and recording it as a customer-supplier relationship with the integration context is the analysis's reading.
sources:
  - intake/arquitetura-troubleshooting-v5.md
relationships:
  - with: investigation
    pattern: customer-supplier
    role: upstream
  - with: glossary
    pattern: open-host-service
    role: downstream
  - with: integration
    pattern: customer-supplier
    role: downstream
---

## What it is

A case is a diagnostic procedure for one kind of reported problem, written and curated by the specialists who know the domain.
Each case names its hypotheses in the order of their precedence, and each hypothesis carries what must be collected to investigate it, the criterion that confirms it, and the outcome and referral it produces.
This is where the modelling effort pays off, because what a case holds is a specialist's judgement and nothing else in the system can supply it.
The published case is what the investigation context consumes, and the contract between them is verified in the act of publishing rather than in the act of executing.

## Rules

A case declares the type of subject it investigates, and every concept it collects must accept that type.
Every term a case names must already exist in the glossary.
The order of a case's hypotheses is the precedence its specialists affirm, and resolving that precedence is the case's own behaviour.
