# ts-js-slug-skill

<p align="center">
  <img src="assets/ts-js-slug-skill-logo.svg" alt="ts-js-slug-skill：txId 是 transactionIdentifier 的一种局部技术名称缩写候选" width="760">
</p>

[简体中文](README.zh-CN.md) | [English](README.md)

一个面向 TypeScript 和 JavaScript 的 Agent Skill，优先保留业务含义和协议术语，共享词典（`temporary` → `tmp`、`context` → `ctx`、`format` → `fmt`）只为适合简化的名称提供可选候选。支持 Claude Code、Codex，以及 [skills CLI](https://github.com/vercel-labs/skills) 支持的其他 agent。

命名规则覆盖浏览器和 Node.js 代码，包括 JSX/TSX；仅在含义清晰时采用 TS/JS 生态中容易识别的缩写。名称建议脚本负责词典查找，已有代码使用 TypeScript/JavaScript 语言服务或 IDE 进行语义重命名。内置 AST 重命名脚本适用于 TypeScript 项目。

## 名称与 Logo 含义

`ts-js-slug-skill` 中的 `ts-js` 明确 TypeScript/JavaScript 定位，`slug` 表达“简短、可读的标识符”，`skill` 表示提供给编程 agent 的可复用命名技能。适合简化的局部技术名称可以在保留含义和项目风格的前提下缩写，例如 `temporaryBufferLength` → `tmpBufLen`。

Logo 以代表 `slug` 的白色 **S** 为中心，两侧代码括号分别使用 TypeScript 蓝和 JavaScript 黄。`TS`/`JS` 标签标明支持的语言。图中的 `transactionIdentifier` → `txId` 仅示意局部技术名称的候选缩写，`BillingTransaction` 等业务实体名称保留完整语义。提供可无损缩放的 [SVG 横版 Logo](assets/ts-js-slug-skill-logo.svg) 和 [方形图标](assets/ts-js-slug-skill-icon.svg)。

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

## 命名优先级

先按业务或协议选择准确名称，再考虑项目风格和词典候选。正式领域术语保留完整词，`HTTP`、`OAuth`、`SQL` 等规范缩略词保持规范写法。命中词典不代表必须替换；缩写损失含义时保留完整名称。

跨模块类型、API 资源和数据库表保留业务限定与核心实体全称。局部名称只有在所在函数、类型和邻近用法足以明确业务含义时，才可以省略重复限定：

| 上下文                         | 命名选择                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| 跨模块业务类型                 | 保留 `BillingTransaction`                                     |
| API 资源 / 数据库表            | 保留 `/billing-transactions` / `billing_transactions`         |
| 含义明确的结算操作内的局部变量 | `billingTransaction` 可简化为 `transaction`，保留业务名词全称 |
| 同时处理结算交易与退款交易     | 保留 `billingTransaction` 和 `refundTransaction`              |

范围配置和项目覆盖词典仍受这些规则约束。即使设置 `exported: true`，也只是扩大候选范围。变更既有公共契约需要明确的业务重构目标和兼容方案。完整决策规则见 [技能说明](skills/ts-js-slug-skill/SKILL.md#meaning-and-boundaries-first)。

## TypeScript 和 JavaScript 命名

以下仅展示语义检查通过后的局部技术名称转换候选。PascalCase 示例还需要将局部类纳入配置范围。

| 命名风格                   | 原名                               | 候选                 |
| -------------------------- | ---------------------------------- | -------------------- |
| camelCase                  | `temporaryBufferLength`            | `tmpBufLen`          |
| PascalCase（启用局部类时） | `TemporaryBuffer`                  | `TmpBuf`             |
| snake_case（遵循项目约定） | `temporary_buffer`                 | `tmp_buf`            |
| SCREAMING_SNAKE_CASE       | `MAXIMUM_BUFFER_LENGTH`            | `MAX_BUF_LEN`        |
| 标识符前缀                 | `$configuration`、`_configuration` | `$config`、`_config` |
| 首字母缩略词               | `HTTPContext`                      | `HTTPCtx`            |

只替换完整单词片段，保留分隔符和大小写，不改未匹配的单词。使用候选名称前检查 TS/JS 关键字、内置名称和作用域冲突。例如 `variable` → `var` 不能用作完整绑定名，而 `variableCount` → `varCount` 合法。保留 `document`、`.length`、`.toString()` 等外部 API，仅对范围内的本地声明及其引用进行重命名。

生成新代码时，逐一检查声明所需的语义内容、边界限定和范围资格，包括中间变量、循环变量。重构已有代码时先按相同规则选择名称，再使用语义重命名，并执行目标仓库配置的类型检查、lint 和相关测试。详见 [技能规则](skills/ts-js-slug-skill/SKILL.md) 和 [TS/JS 工具参考](skills/ts-js-slug-skill/references/language-tooling.md)。

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

内置候选以 [dictionary/default.json](skills/ts-js-slug-skill/dictionary/default.json) 为准，机械转换示例和测试随词典同步。收录词条不代表授权替换业务或协议术语。合并后的词典未收录的单词保持原样。部分词条存在相同缩写；当缩写造成歧义或同作用域冲突时，保留完整名称。

候选映射包括 `configuration/configurations` → `config/configs`、`development` → `dev`、`synchronous` → `sync`、`number` → `num`、`format` → `fmt`。已有的 `config`、`formatter` 和 `formatters` 保持原样。`developer`、`synchronize`、`synchronization`、`numeric`、`subscriber`、`subscription` 及其复数形式保留完整词。

## 自定义

修改 `<skill-dir>/config/default.config.json`，调整生效范围：

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` 可选 `variable`、`parameter`、`localFunction`、`class`；`exported` 控制是否将公共/导出符号纳入候选，默认 `false`。这些配置不能覆盖语义要求，也不代表授权变更既有公共契约。

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
| `scripts/suggest-name.ts`         | 合并词典，执行绑定名语法检查并输出机械候选，语义判断由 agent 完成                    | 否             |
| `scripts/rename-with-ts-morph.ts` | 重命名本地 TypeScript 绑定及其引用，通过别名保留简写对象键和导入导出列表中的外部名称 | 是             |

重命名脚本需要可解析的 `ts-morph`、`tsx` 依赖及目标项目的 `tsconfig.json`。调用方法和依赖设置见 [工具参考](skills/ts-js-slug-skill/references/language-tooling.md)。调用方仍需检查作用范围和公共 API。

## 名称建议脚本

可选脚本需要 Node.js 和 `tsx`，只读取词典并输出建议，不修改源文件：

```bash
npx tsx <skill-dir>/scripts/suggest-name.ts --repo /path/to/project \
  temporaryBufferLength httpContext MAXIMUM_BUFFER_LENGTH
```

```text
temporaryBufferLength -> tmpBufLen
httpContext -> httpCtx
MAXIMUM_BUFFER_LENGTH -> MAX_BUF_LEN
```

脚本处理 ASCII 标识符，保守地保持非 ASCII 名称及两端带双下划线的名称原样。脚本检查完整候选的标识符语法，并按严格模式和模块约定排除保留字及受限绑定名；检查不通过时回退原名。例如 `variable` 保持原样，`variableCount` 缩写为 `varCount`。脚本没有业务或协议上下文，无法判断限定词是否冗余，也不检查源码作用域、内置名称或冲突。agent 需要结合源码审核候选；脚本不会自动删除业务限定或批准重命名。

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
