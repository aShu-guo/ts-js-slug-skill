import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  parseArgs,
  renameIdentifier,
} from '../skills/ts-js-slug-skill/scripts/rename-with-ts-morph.js'

test('parseArgs accepts --flag value form', () => {
  const args = parseArgs(['--file', 'a.ts', '--line', '3', '--col', '7', '--newName', 'biz'])
  assert.deepEqual(args, { file: 'a.ts', line: 3, col: 7, newName: 'biz', tsconfig: undefined })
})

test('parseArgs accepts --flag=value form', () => {
  const args = parseArgs(['--file=a.ts', '--line=3', '--col=7', '--newName=biz'])
  assert.equal(args.file, 'a.ts')
  assert.equal(args.line, 3)
  assert.equal(args.newName, 'biz')
})

test('parseArgs does not consume a following flag as a value', () => {
  // --newName has no value; --file should not be swallowed as its value.
  assert.throws(
    () => parseArgs(['--newName', '--file', 'a.ts', '--line', '1', '--col', '1']),
    /Missing required argument/,
  )
})

test('parseArgs rejects non-integer or non-positive line/col', () => {
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', 'abc', '--col', '1', '--newName', 'x']),
    /--line must be a positive integer/,
  )
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', '0', '--col', '1', '--newName', 'x']),
    /--line must be a positive integer/,
  )
})

test('parseArgs rejects an invalid identifier for --newName', () => {
  assert.throws(
    () => parseArgs(['--file', 'a.ts', '--line', '1', '--col', '1', '--newName', '1bad']),
    /not a valid identifier/,
  )
})

test('renameIdentifier updates all references via the AST, not string literals', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-rename-'))
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  )
  const file = path.join(dir, 'sample.ts')
  // `context` the identifier appears twice; the string "context" must stay untouched.
  const source = [
    'function run(context: number) {',
    '  const label = "context"',
    '  return context + context.toString().length + label.length',
    '}',
    'export {}',
  ].join('\n')
  fs.writeFileSync(file, source)

  // Column of `context` param: `function run(` = 14 chars before it (1-based col 14).
  const result = renameIdentifier({
    file,
    line: 1,
    col: 14,
    newName: 'ctx',
    tsconfig: path.join(dir, 'tsconfig.json'),
  })
  assert.equal(result.oldName, 'context')

  const updated = fs.readFileSync(file, 'utf8')
  assert.match(updated, /function run\(ctx: number\)/)
  assert.match(updated, /return ctx \+ ctx\.toString/)
  // The string literal must be preserved.
  assert.match(updated, /"context"/)
})

test('renameIdentifier preserves object keys when renaming a local parameter', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-rename-keys-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const tsconfig = path.join(dir, 'tsconfig.json')
  fs.writeFileSync(
    tsconfig,
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  )
  const file = path.join(dir, 'sample.ts')
  fs.writeFileSync(file, 'function run(businessContext: number) { return { businessContext } }\n')

  renameIdentifier({ file, line: 1, col: 14, newName: 'bizCtx', tsconfig })

  assert.equal(
    fs.readFileSync(file, 'utf8'),
    'function run(bizCtx: number) { return { businessContext: bizCtx } }\n',
  )
})

test('renameIdentifier preserves imported exports and keys through local aliases', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-rename-import-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const tsconfig = path.join(dir, 'tsconfig.json')
  fs.writeFileSync(
    tsconfig,
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  )
  const apiFile = path.join(dir, 'api.ts')
  const apiSource = 'export const businessContext = 1\n'
  fs.writeFileSync(apiFile, apiSource)
  const file = path.join(dir, 'sample.ts')
  fs.writeFileSync(
    file,
    "import { businessContext } from './api'\nexport const result = { businessContext }\n",
  )

  renameIdentifier({ file, line: 1, col: 10, newName: 'bizCtx', tsconfig })

  assert.equal(fs.readFileSync(apiFile, 'utf8'), apiSource)
  assert.equal(
    fs.readFileSync(file, 'utf8'),
    "import { businessContext as bizCtx } from './api'\nexport const result = { businessContext: bizCtx }\n",
  )
})

test('renameIdentifier preserves destructuring keys and exported aliases', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-rename-alias-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const tsconfig = path.join(dir, 'tsconfig.json')
  fs.writeFileSync(
    tsconfig,
    JSON.stringify({ compilerOptions: { strict: true }, include: ['*.ts'] }),
  )
  const file = path.join(dir, 'sample.ts')
  fs.writeFileSync(
    file,
    'const source = { businessContext: 1 }\nconst { businessContext } = source\nexport { businessContext }\n',
  )

  renameIdentifier({ file, line: 2, col: 9, newName: 'bizCtx', tsconfig })

  assert.equal(
    fs.readFileSync(file, 'utf8'),
    'const source = { businessContext: 1 }\nconst { businessContext: bizCtx } = source\nexport { bizCtx as businessContext }\n',
  )
})
