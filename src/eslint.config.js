// Flat configuration for the `lint` step the project's standard declares
// (backend-node-service.yaml). The rule set encodes the standard's lint-decided
// rules that stock eslint + typescript-eslint can decide today; rules that need
// a project-specific encoding (the ARC, DTO, API and TST layout rules) arrive
// with the tasks that first write the files those rules scope to.
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      // PRH-01 / STK-09 — log output goes through the configured logger; console is not used.
      'no-console': 'error',
      // STK-02 — modules use ESM import/export; require does not appear in source.
      '@typescript-eslint/no-require-imports': 'error',
      // COR-01 — an empty catch is forbidden.
      'no-empty': 'error',
      // TYP-01 — the escape-hatch any type is never used.
      '@typescript-eslint/no-explicit-any': 'error',
      // TYP-03 — a public signature declares its parameter and return types explicitly.
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      // MNT-01 — a function stays within thirty lines and takes at most three positional parameters.
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', { max: 3 }],
      // MNT-02 — unused imports and locals are removed.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // CON-01 — classes and types PascalCase, interfaces I-prefixed, functions and
      // variables camelCase, constants screaming snake case. File-name casing has no
      // stock encoding here and stays a reading until a rule for it exists.
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'variableLike', format: ['camelCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', modifiers: ['const'], format: ['camelCase', 'UPPER_CASE'] },
      ],
    },
  },
);
