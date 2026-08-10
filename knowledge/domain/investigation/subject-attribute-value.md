---
type: value-object
attributes:
  - name: attribute
    type: domain/glossary/subject-attribute
    required: true
  - name: value
    type: string
    required: true
---

## Description

One fact about the subject's identity: a governed attribute name and the concrete value it holds for this instance (the material's example: attribute "id", value "12345").
The same shape citation already gives a concept and a field: one governed name, paired with one free value, so the pair travels as one fact rather than two arrays kept in step by convention.

## Responsibility

Pair one attribute, drawn from the glossary, with the one value it holds for this subject.
