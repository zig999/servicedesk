---
title: Refusal
summary: One reason one case did not pass validation — the rule that refused, where in the case it refused, and the text written for the curator.
ddd: value-object
rationale: The decision states a refusal's position as the hypothesis by name and the offended term or field, and the base's own checks refuse cases that declare no hypothesis at all, so a refusal exists with no hypothesis to name — both position parts are therefore optional; a refusal is a value because two refusals naming the same rule, position and text are interchangeable.
sources:
  - intake/decisoes-cinco-perguntas-2026-08-06.md
attributes:
  - name: rule
    type: string
    required: true
  - name: hypothesis
    type: string
    required: false
  - name: offended_term
    type: string
    required: false
  - name: text
    type: string
    required: true
---

## What it is

A refusal is one reason one case did not pass validation, addressed so the curator fixes it rather than hunts for it.
It names the rule that refused by its identifier, because the rule is the domain's language and outlives whatever check implements it.
Its position is the hypothesis by name and the term or field offended, where the refusal sits at one.
Its text is written for the curator, who is the one who fixes the case.

## Rules

The same rule refusing at two positions produces two refusals, one per position.
A validation answers with every refusal its checks produced.
