---
title: Capability query
summary: What the investigation context calls to have one concept answered about one subject.
ddd: api
ownership: published
sources:
  - intake/arquitetura-troubleshooting-v5.md
---

## What it is

This is what the integration context offers as an open host service, and it is the only way a fact enters an investigation.
It answers one concept, reads and never writes, and runs in the authorization scope of whoever asked.
It answers within its declared deadline or the caller records that it did not.

## Rules

A call that exhausts its deadline produces an evidence recording that, never an exception.
