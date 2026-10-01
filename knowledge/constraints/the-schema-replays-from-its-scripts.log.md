---
entries:
- field: statement
  unstated: The material asks for SQL scripts in the style of migrations under migrations/, versioned, without saying which of those facts is a bound on the solution and which is the project's own arrangement — and the project's standard already states the arrangement half, in STK-06 and PRH-04, differently.
  decided: The constraint states only that the schema replays from the numbered scripts; the directory, the file form and the prohibition on runtime DDL stay with the standard.
  why: Stated here as well, the directory would put two review passes in contradiction over the same file — one requiring migrations/ while the standard's rule reaches src/migrations and nothing else — and the constraint schema assigns a project's arrangement convention to the standard even where the property is identical; what survives a change of standard is that the scripts are the whole schema and their order suffices, which is what this keeps.
---
