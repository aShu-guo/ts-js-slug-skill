# ts-js-slug-skill

<p align="center">
  <img src="assets/ts-js-slug-skill-logo.svg" alt="ts-js-slug-skill：在 TypeScript 和 JavaScript 中将 transactionIdentifier 缩写为 txId" width="760">
</p>

[简体中文](README.zh-CN.md) | [English](README.md)

一个面向 TypeScript 和 JavaScript 的 Agent Skill，使用共享缩写词典（`business` → `biz`、`context` → `ctx`、`configuration` → `config`）统一标识符命名，优先保证含义清晰，同时保留项目命名风格和公共契约。支持 Claude Code、Codex，以及 [skills CLI](https://github.com/vercel-labs/skills) 支持的其他 agent。

命名规则覆盖浏览器和 Node.js 代码，包括 JSX/TSX；仅在含义清晰时采用 TS/JS 生态中容易识别的缩写。名称建议脚本负责词典查找，已有代码使用 TypeScript/JavaScript 语言服务或 IDE 进行语义重命名。内置 AST 重命名脚本适用于 TypeScript 项目。

## 名称与 Logo 含义

`ts-js-slug-skill` 中的 `ts-js` 明确 TypeScript/JavaScript 定位，`slug` 表达“简短、可读的标识符”，`skill` 表示提供给编程 agent 的可复用命名技能。缩写时保留含义和项目命名风格，例如 `businessContext` → `bizCtx`、`business_context` → `biz_ctx`。

Logo 以代表 `slug` 的白色 **S** 为中心，两侧代码括号分别使用 TypeScript 蓝和 JavaScript 黄。`TS`/`JS` 标签标明支持的语言，`transactionIdentifier` → `txId` 展示词典的作用。提供可无损缩放的 [SVG 横版 Logo](assets/ts-js-slug-skill-logo.svg) 和 [方形图标](assets/ts-js-slug-skill-icon.svg)。

## 安装

从 GitHub 安装技能：

```bash
npx skills add aShu-guo/ts-js-slug-skill --skill ts-js-slug-skill
```

也可通过 npm 安装器交互选择 Claude Code/Codex、项目级/全局安装位置：

```bash
npx ts-js-slug-skill
```

| Agent       | 项目级路径                           | 全局路径                             |
| ----------- | ------------------------------------ | ------------------------------------ |
| Claude Code | `./.claude/skills/ts-js-slug-skill/` | `~/.claude/skills/ts-js-slug-skill/` |
| Codex       | `./.agents/skills/ts-js-slug-skill/` | `~/.codex/skills/ts-js-slug-skill/`  |

重复安装会保留已有的 `config/default.config.json` 和 `dictionary/default.json`。团队共享命名约定时可选择项目级安装。

## TypeScript 和 JavaScript 命名

| 命名风格                     | 原名                               | 缩写后               |
| ---------------------------- | ---------------------------------- | -------------------- |
| camelCase                    | `businessContext`                  | `bizCtx`             |
| PascalCase（配置纳入范围时） | `BusinessContext`                  | `BizCtx`             |
| snake_case（遵循项目约定）   | `business_context`                 | `biz_ctx`            |
| SCREAMING_SNAKE_CASE         | `MAXIMUM_BUFFER_LENGTH`            | `MAX_BUF_LEN`        |
| 标识符前缀                   | `$configuration`、`_configuration` | `$config`、`_config` |
| 首字母缩略词                 | `HTTPResponse`                     | `HTTPResp`           |

只替换完整单词片段，保留分隔符和大小写，不改未匹配的单词。使用候选名称前检查 TS/JS 关键字、内置名称和作用域冲突。例如 `variable` → `var` 不能用作完整绑定名，而 `variableCount` → `varCount` 合法。保留 `document`、`.length`、`.toString()` 等外部 API，仅对范围内的本地声明及其引用进行重命名。

生成新代码时，逐一检查范围内的声明，包括中间变量、循环变量。重构已有代码时使用语义重命名，并执行目标仓库配置的类型检查、lint 和相关测试。详见 [技能规则](skills/ts-js-slug-skill/SKILL.md) 和 [TS/JS 工具参考](skills/ts-js-slug-skill/references/language-tooling.md)。

## 内置缩写清单

词典覆盖通用编程、集合、网络、安全、存储、开发工具、图形和单位。单复数分别列出，不自动猜测复数形式。

| 全称                               | 缩写               |
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

内置映射以 [dictionary/default.json](skills/ts-js-slug-skill/dictionary/default.json) 为准，示例和测试随词典同步。合并后的词典未收录的单词保持原样。部分词条存在相同缩写；当缩写造成歧义或同作用域冲突时，保留完整名称。

`configuration/configurations` 使用 `config/configs`，已有的 `config` 保持原样。`dev`、`sync`、`num` 分别表示 `development`、`synchronous`、`number`。`format` 使用 `fmt`，`formatter` 和 `formatters` 保持原样。`developer`、`synchronize`、`synchronization`、`numeric`、`subscriber`、`subscription` 及其复数形式保留完整词。

## 自定义

修改 `<skill-dir>/config/default.config.json`，调整生效范围：

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` 可选 `variable`、`parameter`、`localFunction`、`class`；`exported` 控制公共/导出符号，默认 `false`。

在目标仓库根目录添加 `.ts-js-slug-skill.local.json`，配置项目专属缩写：

```json
{
  "warehouse": "wh",
  "customer": "cust"
}
```

`.ts-js-slug-skill.local.json` 是唯一的项目覆盖文件名，其词条覆盖内置词典。覆盖文件只存单词映射，范围配置仍放在技能配置文件中。

## 内置辅助脚本

安装器会将以下可选脚本复制到技能目录，不会自动执行。

| 脚本                              | 用途                                                                                 | 是否修改源文件 |
| --------------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| `scripts/suggest-name.ts`         | 合并词典，生成合法的本地绑定名建议                                                   | 否             |
| `scripts/rename-with-ts-morph.ts` | 重命名本地 TypeScript 绑定及其引用，通过别名保留简写对象键和导入导出列表中的外部名称 | 是             |

重命名脚本需要可解析的 `ts-morph`、`tsx` 依赖及目标项目的 `tsconfig.json`。调用方法和依赖设置见 [工具参考](skills/ts-js-slug-skill/references/language-tooling.md)。调用方仍需检查作用范围和公共 API。

## 名称建议脚本

可选脚本需要 Node.js 和 `tsx`，只读取词典并输出建议，不修改源文件：

```bash
npx tsx <skill-dir>/scripts/suggest-name.ts --repo /path/to/project \
  businessContext business_context MAXIMUM_BUFFER_LENGTH
```

```text
businessContext -> bizCtx
business_context -> biz_ctx
MAXIMUM_BUFFER_LENGTH -> MAX_BUF_LEN
```

脚本处理 ASCII 标识符，保守地保持非 ASCII 名称及两端带双下划线的名称原样。脚本检查完整候选的标识符语法，并按严格模式和模块约定排除保留字及受限绑定名；检查不通过时回退原名。例如 `variable` 保持原样，`variableCount` 缩写为 `varCount`。脚本不检查源码作用域、内置名称或冲突，agent 仍需结合源码审核建议。

## 更新已有安装

在相同 agent 和安装范围内重新安装 `ts-js-slug-skill`，即可更新技能说明和脚本。已有配置和词典会保留；若曾自定义这些文件，需要手动合并更新后的内置内容。项目覆盖词典统一放在 `.ts-js-slug-skill.local.json`。

## 本地开发

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
node dist/cli.js
```

调试技能内容时可直接链接技能目录：

```bash
ln -sfn /path/to/ts-js-slug-skill/skills/ts-js-slug-skill \
  your-test-project/.claude/skills/ts-js-slug-skill
```

源仓库：[aShu-guo/ts-js-slug-skill](https://github.com/aShu-guo/ts-js-slug-skill)。npm 包：[ts-js-slug-skill](https://www.npmjs.com/package/ts-js-slug-skill)。

## 发布到 npm

| 命令                      | 作用                                    |
| ------------------------- | --------------------------------------- |
| `npm run publish:dry-run` | 执行校验、构建和打包预演，不上传包      |
| `npm run publish:npm`     | 将当前版本以公开方式发布到 npm registry |

两个命令都会通过 `prepublishOnly` 执行类型检查、lint、格式检查、测试和构建。也可单独运行 `npm run verify` 执行校验。

## License

MIT
