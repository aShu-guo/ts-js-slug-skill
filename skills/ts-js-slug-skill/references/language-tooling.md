# Semantic Renaming in TypeScript and JavaScript

Use tools already configured in the target repository. The examples below are options to select from, not dependencies to install for every task. For an LSP rename, review and apply the returned workspace edits across all affected files.

| Language   | Semantic rename options                                                | Validation examples                                        |
| ---------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| TypeScript | Bundled `ts-morph` helper, TypeScript language service, IDE rename     | Project typecheck script or `tsc --noEmit`, relevant tests |
| JavaScript | TypeScript language service with the project's JS settings, IDE rename | Configured JS checker/linter and tests                     |

Use the target project's `tsconfig.json` or `jsconfig.json` so the language service sees the intended files and module resolution. JavaScript files in a TypeScript project need `allowJs`; `checkJs` controls diagnostics separately. JSX/TSX needs the project's JSX settings. Preserve these settings rather than creating a new configuration just to rename a symbol.

Tool support depends on the symbol and project configuration. Dynamic property access, reflection, generated code, and external consumers may need additional inspection. Preserve import/export names, object keys, component props, and browser/Node.js APIs when only a local binding is eligible. A successful semantic rename does not establish compatibility for external consumers.

## Bundled TypeScript Helper

The target project needs `ts-morph`, `tsx`, and a suitable `tsconfig.json`; resolve dependencies according to that project's package manager and module layout. Run the helper in an environment where those packages are resolvable from the script. Do not assume an installed skill can resolve another project's dependencies automatically.

```bash
npx tsx <skill-dir>/scripts/rename-with-ts-morph.ts \
  --file src/example.ts --line 12 --col 7 --newName bizCtx \
  --tsconfig /path/to/project/tsconfig.json
```

Line and column are 1-based. The helper updates the selected symbol's references and saves the project. It uses aliases to preserve shorthand object keys and import/export specifier names when renaming a local binding. Scope eligibility, public API compatibility, keyword/shadowing checks, and validation remain the caller's responsibility.
