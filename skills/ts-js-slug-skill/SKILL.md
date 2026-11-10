---
name: ts-js-slug-skill
description: Choose TypeScript and JavaScript identifiers, including JSX/TSX, with business and protocol semantics first and optional dictionary abbreviations for clear local names.
---

# TS/JS Slug Skill

Choose names that preserve business meaning and protocol terminology in TypeScript and JavaScript, including browser, Node.js, and JSX/TSX code. The shared dictionary supplies optional abbreviation candidates; a dictionary match alone is never a reason to rename an identifier.

## Meaning and Boundaries First

Use the project's domain glossary, API/schema definitions, protocol specifications, and existing usages to identify the intended concept. Keep formal business and protocol terms in full. Preserve canonical names and established acronyms such as `HTTP`, `OAuth`, and `SQL` in their conventional spelling. Apply project style and dictionary suggestions only after these semantic requirements are satisfied.

For types shared across modules, API resource names, and database table names, retain the business qualifiers and full entity terms that distinguish the concept. This applies when creating new names as well as reviewing existing ones. For example, keep `BillingTransaction`, `/billing-transactions`, and `billing_transactions`; substituting `Transaction`, `Tx`, or `BillingTx` for the shared business type loses required information.

For a local binding, remove a redundant qualifier only when the enclosing function, types, and nearby usages make the business meaning unambiguous. Within a billing operation, `billingTransaction` may become `transaction`, retaining the full business noun. When billing and refund transactions are both present, keep `billingTransaction` and `refundTransaction`. Locality alone does not justify shortening a business term to `tx`; ordinary technical helpers may use recognizable forms such as `ctx`, `idx`, and `tmp` when they remain clear.

Preserve the full name when the context does not establish which information can be omitted. The dictionary and project overrides cannot override these requirements.

## Resolve Scope and Dictionary

Read `config/default.config.json` for the eligible identifier kinds (`variable`, `parameter`, `localFunction`, `class`) and whether public/exported symbols may be considered. The defaults cover variables and parameters, with `exported: false`. `exported: true` only expands candidate eligibility; the meaning and boundary rules above still apply. Configure scope in that file; project dictionary overrides contain word mappings only.

Merge dictionaries from lowest to highest priority:

1. This skill's `dictionary/default.json`.
2. `.ts-js-slug-skill.local.json` at the target repository root, when present.

Each override is a flat JSON object mapping lowercase English words to lowercase abbreviations. Preserve unrelated defaults when merging. After determining the required semantic content of an eligible name, consult the dictionary for useful candidates. Include intermediate locals, loop variables, and destructured bindings in the naming review.

When adding or changing mappings, prefer established TS/JS forms over maximum compression. Words may share an abbreviation only for the same concept, such as `initialize` and `initialization`; distinguish roles such as `developer` and `development`. Keep full words when an abbreviation is ambiguous or lacks evidence of established use. Put project-specific conventions in project overrides.

## Generate Names

For a candidate that passes the meaning and boundary checks, replace complete word segments only. Preserve separators, acronym casing, and `$`/`_` prefixes or suffixes; adapt each replacement to its original segment's case. The following examples illustrate mechanical transformations of eligible local technical names; a local class also requires `class` in the configured scope.

| Naming style                          | Before                             | Candidate            |
| ------------------------------------- | ---------------------------------- | -------------------- |
| camelCase                             | `temporaryBufferLength`            | `tmpBufLen`          |
| PascalCase (local class when enabled) | `TemporaryBuffer`                  | `TmpBuf`             |
| snake_case                            | `temporary_buffer`                 | `tmp_buf`            |
| SCREAMING_SNAKE_CASE                  | `MAXIMUM_BUFFER_LENGTH`            | `MAX_BUF_LEN`        |
| Acronyms                              | `HTTPContext`                      | `HTTPCtx`            |
| Identifier prefixes                   | `$configuration`, `_configuration` | `$config`, `_config` |

Keep unmatched words intact: `businessman` and `contextual` are not matches for `business` and `context`. Apply plural mappings only when the dictionary contains that plural; avoid inferring irregular forms.

Check the complete candidate against TS/JS keywords, built-ins, and names already visible in that scope. For example, `variable` → `var`, `constant` → `const`, and `enumeration` → `enum` produce invalid binding names, while `variableCount` → `varCount` is valid. Retain the full segment when its abbreviation would be invalid, shadow an important built-in, or create ambiguity or a collision.

Keep existing public contracts intact: exported symbols, API resource names, serialized field names, database tables/columns, component props, and framework/reflection hooks. Changing a contract requires an explicit business refactoring goal and a compatibility plan; scope settings alone do not authorize it. Preserve external browser and Node.js APIs, including `document`, `.length`, `.prototype`, and `.toString()`. For imports and object destructuring, preserve the external name and use an alias only when the local name passes the same semantic checks, such as `const { billingTransaction: transaction } = billingResult` in an unambiguous billing operation.

Before finishing new code, review each declared identifier for required semantic content, boundary qualifications, scope eligibility, and clarity. Check locals introduced by the code itself as well as names mentioned in the request. Keeping a full name that satisfies these rules is a valid outcome even when the dictionary contains a shorter candidate.

### Optional Name Suggestions

For repeatable dictionary lookups, use the name-suggestion helper (Node.js and `tsx` required):

```bash
npx tsx <skill-dir>/scripts/suggest-name.ts --repo /path/to/project temporaryBufferLength httpContext MAXIMUM_BUFFER_LENGTH
```

It merges the same dictionary files and prints mechanical candidates while preserving ASCII word boundaries, separators, acronyms, digits, and prefixes. Non-ASCII names and names enclosed in double underscores remain unchanged. It validates each complete candidate's identifier syntax and conservatively excludes reserved or restricted binding names under strict/module conventions, returning the original name on failure. Legal compounds such as `varCount` remain eligible. It has no business or protocol context and cannot decide whether a qualifier is redundant. It also does not inspect source scope, built-ins, or collisions. The agent must review its output against the meaning and boundary rules; the helper does not automatically remove business qualifiers or approve a rename.

## Refactor Existing Symbols

Identify the declaration, its references, and whether the name crosses a module or contract boundary. Apply the meaning and boundary rules before choosing a replacement, then use the TypeScript/JavaScript language service, IDE semantic rename, or the bundled TypeScript helper. Plain-text replacement cannot distinguish bindings from strings, external keys, or unrelated locals.

Read [references/language-tooling.md](references/language-tooling.md) when choosing a rename tool and validation commands for TS/JS or JSX/TSX. The bundled `scripts/rename-with-ts-morph.ts` uses a TypeScript project configuration. If semantic rename is unavailable, limit manual edits to a small, fully inspected set of declarations and references, and report that limitation.

Review the resulting diff for unintended API/key changes, shadowing, and missed dynamic references. Run the repository's configured type checks, lint, and relevant tests. Report any existing failures separately from failures caused by the rename, and state any validation that could not be run.
