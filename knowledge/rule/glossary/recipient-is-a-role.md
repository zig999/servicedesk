---
title: A recipient is a role
summary: A referral goes to an operational role and never to a named person.
ddd: invariant
statement: A recipient MUST name an operational role, never a person.
sources:
  - intake/arquitetura-troubleshooting-v5.md
constrains:
  - definition/glossary/recipient
examples:
  - Given a referral to second-line support, when the person staffing that queue changes, then the referral stays valid.
---

## What it is

The recipient vocabulary is the most stable of the four because it names queues rather than people.
Naming a person would make a referral expire whenever somebody changed job.

## Rules

A recipient names a role.
