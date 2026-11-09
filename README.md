# ts-js-slug-skill

<p align="center">
  <img src="assets/ts-js-slug-skill-logo.svg" alt="ts-js-slug-skill: transactionIdentifier becomes txId in TypeScript and JavaScript" width="760">
</p>

[简体中文](README.zh-CN.md) | [English](README.md)

An agent skill for clear, consistent TypeScript and JavaScript identifier naming. Apply a shared abbreviation dictionary (`business` → `biz`, `context` → `ctx`, `configuration` → `config`) while preserving meaning, project naming conventions, and public contracts. Works with Claude Code, Codex, and agents supported by the [skills CLI](https://github.com/vercel-labs/skills).

Naming guidance covers browser and Node.js code, including JSX/TSX. Prefer recognizable TS/JS abbreviations when they preserve clarity. The name-suggestion helper performs dictionary lookups; existing code uses the TypeScript/JavaScript language service or IDE semantic rename. The bundled AST rename helper supports TypeScript projects.

## Name and Logo

`ts-js-slug-skill` names its TypeScript/JavaScript scope explicitly. “Slug” represents a compact, readable identifier, and “skill” describes the reusable naming guidance for coding agents. It preserves meaning and project conventions when shortening names, such as `businessContext` → `bizCtx` or `business_context` → `biz_ctx`.

The logo places a white **S** for `slug` between blue TypeScript and yellow JavaScript code brackets. The `TS`/`JS` labels identify the supported languages, and `transactionIdentifier` → `txId` demonstrates the dictionary. The [SVG logo](assets/ts-js-slug-skill-logo.svg) and [square icon](assets/ts-js-slug-skill-icon.svg) scale without losing detail.

## Install

Install the skill from GitHub:

```bash
npx skills add aShu-guo/ts-js-slug-skill --skill ts-js-slug-skill
```

Or use the npm installer to select Claude Code/Codex and project/global scope interactively:

```bash
npx ts-js-slug-skill
```

| Agent       | Project path                         | Global path                          |
| ----------- | ------------------------------------ | ------------------------------------ |
| Claude Code | `./.claude/skills/ts-js-slug-skill/` | `~/.claude/skills/ts-js-slug-skill/` |
| Codex       | `./.agents/skills/ts-js-slug-skill/` | `~/.codex/skills/ts-js-slug-skill/`  |

Reinstalling preserves existing `config/default.config.json` and `dictionary/default.json`. Use project scope to share conventions with your team.

## TypeScript and JavaScript Naming

| Naming style                    | Before                             | After                |
| ------------------------------- | ---------------------------------- | -------------------- |
| camelCase                       | `businessContext`                  | `bizCtx`             |
| PascalCase (when in scope)      | `BusinessContext`                  | `BizCtx`             |
| snake_case (project convention) | `business_context`                 | `biz_ctx`            |
| SCREAMING_SNAKE_CASE            | `MAXIMUM_BUFFER_LENGTH`            | `MAX_BUF_LEN`        |
| Identifier prefixes             | `$configuration`, `_configuration` | `$config`, `_config` |
| Acronyms                        | `HTTPResponse`                     | `HTTPResp`           |

Match whole word segments, preserve separators/case, and leave unmatched words intact. Check TS/JS keywords, built-ins, and scope collisions before using a suggestion. For example, `variable` → `var` is invalid as a complete binding name, while `variableCount` → `varCount` is valid. Keep external APIs such as `document`, `.length`, and `.toString()` intact; only eligible local declarations and their references are candidates for renaming.

For new code, check every eligible declaration, including intermediate locals and loop bindings. For existing code, use a semantic rename tool and run the repository's configured type checks, lint, and relevant tests. See the [skill instructions](skills/ts-js-slug-skill/SKILL.md) and [TS/JS tooling reference](skills/ts-js-slug-skill/references/language-tooling.md).

## Built-in Dictionary

The dictionary covers general programming, collections, networking, security, storage, tooling, graphics, and units. Singular/plural forms are explicit mappings.

| Full word                          | Abbreviation       |
| ---------------------------------- | ------------------ |
| business / context / configuration | biz / ctx / config |
| parameter / parameters             | param / params     |
| request / response                 | req / resp         |
| buffer / length                    | buf / len          |
| dictionary / dictionaries          | dict / dicts       |
| error / errors                     | err / errs         |
| authentication / authorization     | auth / authz       |
| transaction / transactions         | tx / txs           |
| organization / department          | org / dept         |
| latitude / longitude               | lat / lng          |
| notification / notifications       | notif / notifs     |
| vector / matrix                    | vec / mat          |

The authoritative built-in mappings are in [dictionary/default.json](skills/ts-js-slug-skill/dictionary/default.json); examples and tests follow that file. Words absent from the resolved dictionary remain unchanged. Some words share an abbreviation; keep the full name when the shorter form would obscure meaning or collide in the target scope.

`configuration/configurations` become `config/configs`; existing `config` stays unchanged. `dev`, `sync`, and `num` represent `development`, `synchronous`, and `number` respectively. `format` becomes `fmt`; `formatter` and `formatters` stay unchanged. `component` becomes `comp`, while `components` stays unchanged. Keep `developer`, `synchronize`, `synchronization`, `numeric`, `subscriber`, and `subscription` in full, along with their plural forms.

## Customize

Edit `<skill-dir>/config/default.config.json` to choose eligible identifier kinds:

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` accepts `variable`, `parameter`, `localFunction`, and `class`. `exported` controls public/exported symbols and defaults to `false`.

Add a flat dictionary override at the target repository root as `.ts-js-slug-skill.local.json`:

```json
{
  "warehouse": "wh",
  "customer": "cust"
}
```

Entries in `.ts-js-slug-skill.local.json` merge over built-in defaults; this is the only project override filename. Override files contain word mappings only; scope stays in the skill config.

## Bundled Scripts

Installation copies these optional helpers into the skill directory; it does not run them automatically.

| Script                            | Purpose                                                                                                                   | Writes source files |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `scripts/suggest-name.ts`         | Merge dictionaries and suggest valid local binding names                                                                  | No                  |
| `scripts/rename-with-ts-morph.ts` | Rename local TypeScript bindings and references, preserving shorthand keys and import/export specifier names with aliases | Yes                 |

The rename helper requires resolvable `ts-morph` and `tsx` dependencies and a target `tsconfig.json`. See the [tooling reference](skills/ts-js-slug-skill/references/language-tooling.md) for invocation and dependency setup. Scope eligibility and public API review remain the caller's responsibility.

## Suggest Names

The optional helper requires Node.js and `tsx`. It reads dictionaries and prints suggestions without editing source files:

```bash
npx tsx <skill-dir>/scripts/suggest-name.ts --repo /path/to/project \
  businessContext business_context MAXIMUM_BUFFER_LENGTH
```

```text
businessContext -> bizCtx
business_context -> biz_ctx
MAXIMUM_BUFFER_LENGTH -> MAX_BUF_LEN
```

The helper handles ASCII identifiers and conservatively leaves non-ASCII names and names enclosed in double underscores unchanged. It checks each complete candidate's identifier syntax and rejects reserved or restricted binding names under strict/module conventions, falling back to the original name. For example, `variable` stays `variable`, while `variableCount` becomes `varCount`. It does not inspect source scope, built-ins, or collisions; the agent must review suggestions in their source context.

## Update an Installation

Reinstall `ts-js-slug-skill` in the same agent/scope to update skill instructions and scripts. Existing protected configurations and dictionaries are preserved; merge updated built-in entries manually if you customized those files. Store project overrides in `.ts-js-slug-skill.local.json`.

## Development

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
node dist/cli.js
```

For local skill-content iteration, link the skill folder directly:

```bash
ln -sfn /path/to/ts-js-slug-skill/skills/ts-js-slug-skill \
  your-test-project/.claude/skills/ts-js-slug-skill
```

Source: [aShu-guo/ts-js-slug-skill](https://github.com/aShu-guo/ts-js-slug-skill). npm: [ts-js-slug-skill](https://www.npmjs.com/package/ts-js-slug-skill).

## Publish to npm

| Command                   | Effect                                                        |
| ------------------------- | ------------------------------------------------------------- |
| `npm run publish:dry-run` | Validate, build, and preview the package without uploading it |
| `npm run publish:npm`     | Publish the current version publicly to the npm registry      |

Both commands run type checking, lint, formatting checks, tests, and the build through `prepublishOnly`. Run `npm run verify` to perform the checks independently.

## License

MIT
