---
name: ts-js-slug-skill
description: Apply a configurable abbreviation dictionary when writing or refactoring TypeScript and JavaScript identifiers, including JSX/TSX, preserving clarity, project naming style, and public contracts.
---

# TS/JS Slug Skill

Use the shared dictionary for clear, consistent TypeScript and JavaScript identifiers in browser and Node.js code, including JSX/TSX. Prefer recognizable TS/JS abbreviations when they preserve meaning and match the repository's conventions.

## Resolve Scope and Dictionary

Read `config/default.config.json` for the eligible identifier kinds (`variable`, `parameter`, `localFunction`, `class`) and whether public/exported symbols are eligible. The defaults cover variables and parameters, with `exported: false`. Configure scope in that file; project dictionary overrides contain word mappings only.

Merge dictionaries from lowest to highest priority:

1. This skill's `dictionary/default.json`.
2. `.ts-js-slug-skill.local.json` at the target repository root, when present.

Each override is a flat JSON object mapping lowercase English words to lowercase abbreviations. Preserve unrelated defaults when merging. Consult the dictionary for every eligible identifier, including intermediate locals, loop variables, and destructured bindings introduced by the code itself.

When adding or changing mappings, prefer established TS/JS forms over maximum compression. Words may share an abbreviation only for the same concept, such as `initialize` and `initialization`; distinguish roles such as `developer` and `development`. Keep full words when an abbreviation is ambiguous or lacks evidence of established use. Put project-specific conventions in project overrides.

## Generate Names

Replace complete word segments only. Preserve separators, acronym casing, and `$`/`_` prefixes or suffixes; adapt each replacement to its original segment's case.

| Naming style         | Before                                  | After                 |
| -------------------- | --------------------------------------- | --------------------- |
| camelCase            | `businessContext`                       | `bizCtx`              |
| PascalCase           | `BusinessContext`                       | `BizCtx`              |
| snake_case           | `business_context`                      | `biz_ctx`             |
| SCREAMING_SNAKE_CASE | `BUSINESS_CONTEXT`                      | `BIZ_CTX`             |
| Acronyms             | `HTTPResponse`                          | `HTTPResp`            |
| Identifier prefixes  | `$businessContext`, `_business_context` | `$bizCtx`, `_biz_ctx` |

Keep unmatched words intact: `businessman` and `contextual` are not matches for `business` and `context`. Apply plural mappings only when the dictionary contains that plural; avoid inferring irregular forms.

Check the complete candidate against TS/JS keywords, built-ins, and names already visible in that scope. For example, `variable` → `var`, `constant` → `const`, and `enumeration` → `enum` produce invalid binding names, while `variableCount` → `varCount` is valid. Retain the full segment when its abbreviation would be invalid, shadow an important built-in, or create ambiguity or a collision.

Keep public contracts intact unless explicitly included in scope: exported symbols, serialized field names, database columns, component props, and framework/reflection hooks. Preserve external browser and Node.js APIs, including `document`, `.length`, `.prototype`, and `.toString()`. For imports and object destructuring, preserve the external name and abbreviate only the local binding with an alias, such as `import { businessContext as bizCtx }` or `const { businessContext: bizCtx } = source`.

Before finishing new code, review every declared identifier against the resolved scope and dictionary, including locals that were not mentioned in the user's request.

### Optional Name Suggestions

For repeatable dictionary lookups, use the name-suggestion helper (Node.js and `tsx` required):

```bash
npx tsx <skill-dir>/scripts/suggest-name.ts --repo /path/to/project businessContext business_context BUSINESS_CONTEXT
```

It merges the same dictionary files and prints suggestions while preserving ASCII word boundaries, separators, acronyms, digits, and prefixes. Non-ASCII names and names enclosed in double underscores remain unchanged. It validates each complete candidate's identifier syntax and conservatively excludes reserved or restricted binding names under strict/module conventions, returning the original name on failure. Legal compounds such as `varCount` remain eligible. It does not inspect source scope, built-ins, or collisions; apply the checks above before using its output.

## Refactor Existing Symbols

Identify the declaration and its references, then use the TypeScript/JavaScript language service, IDE semantic rename, or the bundled TypeScript helper. Plain-text replacement cannot distinguish bindings from strings, external keys, or unrelated locals.

Read [references/language-tooling.md](references/language-tooling.md) when choosing a rename tool and validation commands for TS/JS or JSX/TSX. The bundled `scripts/rename-with-ts-morph.ts` uses a TypeScript project configuration. If semantic rename is unavailable, limit manual edits to a small, fully inspected set of declarations and references, and report that limitation.

Review the resulting diff for unintended API/key changes, shadowing, and missed dynamic references. Run the repository's configured type checks, lint, and relevant tests. Report any existing failures separately from failures caused by the rename, and state any validation that could not be run.
