---
title: Recipient
summary: Who a referral goes to, named as an operational role.
ddd: value-object
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: name
    type: string
    required: true
gaps:
  - field: attributes.name.values
    why: The fourth decision is open — the material states the recipients are the real operational queues and does not name them.
---

## What it is

A recipient is a real operational queue, and it is the most stable of the four vocabularies.
It names a role and never a person, which is what keeps a referral valid when whoever holds the role changes.

## Rules

A recipient a case names must exist in the glossary.
