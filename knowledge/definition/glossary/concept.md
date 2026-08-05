---
title: Concept
summary: A fact an investigation can collect, named once for the whole system and answered by exactly one capability.
ddd: value-object
identity:
  - name
sources:
  - intake/arquitetura-troubleshooting-v5.md
attributes:
  - name: name
    type: string
    required: true
  - name: accepts
    type: list
    of: definition/glossary/subject-type
    min_items: 1
    required: true
  - name: ttl
    type: integer
    required: true
gaps:
  - field: attributes.ttl.unit
    why: The fourth lacuna is open — the material states every concept declares a ttl standing for the strictest tolerance among the cases that use it, and gives neither its unit nor any value.
---

## What it is

A concept is what a case asks for by name, and it is the unit the whole system agrees on — a hypothesis collects concepts, an evidence answers one, and a citation points at one.
A concept declares which types of subject it accepts, and a capability resolves internally whatever it needs to derive from the subject it was given.
Its ttl says how stale the fact behind it may be, and it is the strictest tolerance among the cases that use it, so a more tolerant case simply gets less benefit and never a wrong answer.

## Rules

A concept a case names must exist in the glossary, must declare a ttl, and must accept that case's type of subject.
A concept named by a case that has no registered read-only capability makes the case unpublishable.
