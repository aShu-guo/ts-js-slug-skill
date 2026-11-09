import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  abbreviateIdentifier,
  loadDictionary,
} from '../skills/ts-js-slug-skill/scripts/suggest-name.js'

test('suggestions preserve TypeScript and JavaScript naming conventions', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-names-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const dict = loadDictionary(dir)
  const cases = {
    businessContext: 'bizCtx',
    BusinessContext: 'BizCtx',
    business_context: 'biz_ctx',
    BUSINESS_CONTEXT: 'BIZ_CTX',
    $businessContext: '$bizCtx',
    _business_context_: '_biz_ctx_',
    HTTPResponse: 'HTTPResp',
    XMLHttpRequest: 'XMLHttpReq',
    HTTP_RESPONSE: 'HTTP_RESP',
    version2Configuration: 'version2Config',
    MAXIMUM_BUFFER_LENGTH: 'MAX_BUF_LEN',
    connection_parameters: 'connection_params',
    organizationDepartment: 'orgDept',
    serialization_error: 'serialization_err',
    businessman: 'businessman',
    contextual: 'contextual',
    __context__: '__context__',
    用户Context: '用户Context',
    stringValue: 'strVal',
    constructor: 'constructor',
  }

  for (const [name, expected] of Object.entries(cases)) {
    assert.equal(abbreviateIdentifier(name, dict), expected, name)
  }
})

test('default suggestions preserve distinct concepts and readable configuration names', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-concepts-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const dict = loadDictionary(dir)
  const cases = {
    configuration: 'config',
    configurations: 'configs',
    config: 'config',
    configContext: 'configCtx',
    developmentEnvironment: 'devEnv',
    developer: 'developer',
    developers: 'developers',
    synchronousRequest: 'syncReq',
    synchronize: 'synchronize',
    synchronization: 'synchronization',
    numberValue: 'numVal',
    numbers: 'nums',
    numericValue: 'numericVal',
    component: 'comp',
    components: 'components',
    format: 'fmt',
    formatName: 'fmtName',
    formatter: 'formatter',
    formatters: 'formatters',
    subscriber: 'subscriber',
    subscribers: 'subscribers',
    subscription: 'subscription',
    subscriptions: 'subscriptions',
    transaction: 'tx',
    transactions: 'txs',
    transactionIdentifier: 'txId',
    equivalent: 'equivalent',
    equivalents: 'equivalents',
    filename: 'filename',
    filenames: 'filenames',
    interfaceName: 'interfaceName',
    interfaces: 'interfaces',
  }

  for (const [name, expected] of Object.entries(cases)) {
    assert.equal(abbreviateIdentifier(name, dict), expected, name)
  }
})

test('invalid binding suggestions fall back without blocking legal compound names', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-bindings-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const dict = loadDictionary(dir)
  const cases = {
    variable: 'variable',
    constant: 'constant',
    enumeration: 'enumeration',
    variableCount: 'varCount',
    constantValue: 'constVal',
    enumerationValues: 'enumVals',
    Variable: 'Var',
    CONSTANT: 'CONST',
    $variable: '$var',
    _constant: '_const',
    function: 'fn',
    definition: 'def',
    string: 'str',
    asynchronous: 'async',
  }

  for (const [name, expected] of Object.entries(cases)) {
    assert.equal(abbreviateIdentifier(name, dict), expected, name)
  }
})

test('project abbreviations cannot introduce reserved or restricted binding names', () => {
  for (const abbr of ['class', 'await', 'yield', 'interface', 'eval', 'arguments']) {
    const dict = { candidate: abbr }
    assert.equal(abbreviateIdentifier('candidate', dict), 'candidate', abbr)
    assert.equal(abbreviateIdentifier('candidateCount', dict), `${abbr}Count`, abbr)
  }
  assert.equal(abbreviateIdentifier('business-context', { business: 'biz' }), 'business-context')
})

test('project overrides replace selected defaults and preserve unrelated entries', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-overrides-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const defaults = loadDictionary(dir)
  assert.equal(defaults.context, 'ctx')
  fs.writeFileSync(
    path.join(dir, '.ts-js-slug-skill.local.json'),
    '{"context":"ctxt","warehouse":"wh","customer":"cust","account":"acct"}',
  )

  const dict = loadDictionary(dir)
  assert.equal(dict.context, 'ctxt')
  assert.equal(dict.warehouse, 'wh')
  assert.equal(dict.customer, 'cust')
  assert.equal(dict.account, 'acct')
  assert.equal(dict.business, 'biz')
  assert.equal(abbreviateIdentifier('warehouseCustomerAccountContext', dict), 'whCustAcctCtxt')
})

test('invalid dictionary overrides fail clearly instead of producing broken suggestions', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-invalid-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const file = path.join(dir, '.ts-js-slug-skill.local.json')
  for (const content of ['null', '[]', '"text"']) {
    fs.writeFileSync(file, content)
    assert.throws(() => loadDictionary(dir), /Dictionary must be a JSON object/)
  }
  for (const content of ['{"context":1}', '{"Context":"ctx"}', '{"context":"bad-name"}']) {
    fs.writeFileSync(file, content)
    assert.throws(() => loadDictionary(dir), /Invalid dictionary entry/)
  }
})

test('CLI uses dictionaries from the requested project', (ctx) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slug-cli-'))
  ctx.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  fs.writeFileSync(
    path.join(dir, '.ts-js-slug-skill.local.json'),
    '{"warehouse":"wh","container":"class"}',
  )
  const script = fileURLToPath(
    new URL('../skills/ts-js-slug-skill/scripts/suggest-name.ts', import.meta.url),
  )
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', script, '--repo', dir, 'warehouseContext', 'BUSINESS_CONTEXT', 'container'],
    { encoding: 'utf8' },
  )

  assert.equal(result.status, 0, result.stderr)
  assert.equal(
    result.stdout,
    'warehouseContext -> whCtx\nBUSINESS_CONTEXT -> BIZ_CTX\ncontainer -> container\n',
  )
})
