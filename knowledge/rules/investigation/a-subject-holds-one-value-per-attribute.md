---
type: invariant
statement: A subject holds at most one attribute-value per subject attribute — where two attribute-values assembled for one subject name the same subject attribute, the subject carries the value of the one recorded first and the later one's value is dropped.
constrains:
  - domain/investigation/subject
---

## Description

The entry point assembles the whole set of attribute-values before the diagnose call (domain/investigation/subject), and nothing about that assembly stops one attribute from being reached twice — two resolutions of the same customer, or two placeholders naming one attribute in the same call.
A subject carrying two values for one attribute identifies two things at once, and every consumer of the set would have to choose between them on its own account: a capability's connector resolves ${subject:<attribute-name>} to one value (rules/integration/an-http-connector-configuration-declares-its-call), and the coverage check reads one value per required attribute (rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes). Deciding it once, at assembly, is what keeps those consumers from each answering it differently.
The first recorded value wins because assembly is additive — what is already established about the subject's identity stands, and a later arrival never silently rewrites it. This drops a value rather than refusing the subject: a duplicate is not a subject that identifies nothing (a-subject-carries-at-least-one-attribute) nor a name the glossary does not hold (a-subject-attribute-is-drawn-from-the-glossary), and the set the capabilities receive is still the whole set of what identifies the instance.
