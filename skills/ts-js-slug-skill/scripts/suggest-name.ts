import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type Dictionary = Record<string, string>

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const RESERVED_BINDINGS = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

function readDictionary(file: string | URL): Dictionary {
  const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Dictionary must be a JSON object: ${file}`)
  }

  const dict: Dictionary = {}
  for (const [word, abbr] of Object.entries(raw)) {
    if (!/^[a-z]+$/.test(word) || typeof abbr !== 'string' || !/^[a-z][a-z0-9]*$/.test(abbr)) {
      throw new Error(`Invalid dictionary entry "${word}" in ${file}`)
    }
    dict[word] = abbr
  }
  return dict
}

export function loadDictionary(repoRoot: string = process.cwd()): Dictionary {
  const dict = readDictionary(new URL('../dictionary/default.json', import.meta.url))
  const file = path.join(repoRoot, '.ts-js-slug-skill.local.json')
  return fs.existsSync(file) ? { ...dict, ...readDictionary(file) } : dict
}

export function abbreviateIdentifier(name: string, dict: Dictionary): string {
  if (/[^\p{ASCII}]/u.test(name) || /^__.*__$/.test(name)) return name

  const candidate = name.replace(/[A-Z]+(?=[A-Z][a-z]|[0-9]|$)|[A-Z]?[a-z]+|[A-Z]+/g, (word) => {
    const key = word.toLowerCase()
    if (!Object.hasOwn(dict, key)) return word

    const abbr = dict[key]
    if (word === word.toUpperCase()) return abbr.toUpperCase()
    if (word[0] === word[0].toUpperCase()) return abbr[0].toUpperCase() + abbr.slice(1)
    return abbr
  })

  return IDENTIFIER_RE.test(candidate) && !RESERVED_BINDINGS.has(candidate) ? candidate : name
}

const USAGE = 'Usage: tsx suggest-name.ts [--repo <path>] <identifier> [identifier ...]'

function main(argv: string[]) {
  let repoRoot = process.cwd()
  const names: string[] = []
  for (let idx = 0; idx < argv.length; idx++) {
    const arg = argv[idx]
    if (arg === '--help') {
      console.log(USAGE)
      return
    }
    if (arg === '--repo') {
      const dir = argv[++idx]
      if (!dir || dir.startsWith('--')) throw new Error(`--repo requires a path.\n${USAGE}`)
      repoRoot = path.resolve(dir)
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}\n${USAGE}`)
    } else {
      names.push(arg)
    }
  }
  if (names.length === 0) throw new Error(USAGE)

  const dict = loadDictionary(repoRoot)
  for (const name of names) {
    console.log(`${name} -> ${abbreviateIdentifier(name, dict)}`)
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === path.resolve(fileURLToPath(import.meta.url))) {
  try {
    main(process.argv.slice(2))
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}
