---
title: A recipient is a role
summary: A referral goes to an operational role and never to a named person.
ddd: invariant
statement: A recipient MUST name an operational role, never a person.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
constrains:
  - definition/glossary/recipient
examples:
  - Given a referral to second-line support, when the person staffing that queue changes, then the referral stays valid.
---

## What it is

The recipient vocabulary is the most stable of the four because it names queues rather than people.
Naming a person would make a referral expire whenever somebody changed job.
This holds over the glossary's own entries and not over a case, so every recipient the glossary publishes is already a role and a check over a case tests only that the recipient exists.
Nothing verifies that a registered recipient names a role rather than a person; whoever registers it asserts it, and this rule is the assertion they are held to.

## Rules

A recipient names a role.
