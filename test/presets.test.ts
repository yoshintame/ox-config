import { afterAll, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const bin = (name: string) => join(root, 'node_modules', '.bin', name)

const dirs: string[] = []

afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
})

const project = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), 'ox-config-'))
  dirs.push(dir)
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, name), content)
  }
  return dir
}

const run = (dir: string, argv: string[]) => {
  const result = Bun.spawnSync(argv, { cwd: dir })
  return { code: result.exitCode, output: result.stdout.toString() }
}

const oxlintConfig = (presets: string[]) => `
import { ${presets.join(', ')} } from '${join(root, 'src/oxlint.ts')}'
export default { extends: [${presets.join(', ')}] }
`

const oxfmtConfig = (presets: string[]) => `
import { ${presets.join(', ')} } from '${join(root, 'src/oxfmt.ts')}'
export default { ${presets.map((p) => `...${p}`).join(', ')} }
`

test('oxlint base passes clean code and reports a ported Biome rule', () => {
  const dir = project({
    'oxlint.config.ts': oxlintConfig(['base']),
    'clean.ts': 'export const answer = 42\n',
    'two-vars.ts': 'let a = 1, b = 2\nexport { a, b }\n',
  })

  expect(run(dir, [bin('oxlint'), 'clean.ts']).code).toBe(0)

  const result = run(dir, [bin('oxlint'), 'two-vars.ts'])
  expect(result.code).toBe(1)
  expect(result.output).toContain('one-var')
})

test('oxlint base sorts names inside braces', () => {
  const dir = project({
    'oxlint.config.ts': oxlintConfig(['base']),
    'names.ts': "import { b, a } from './x'\nexport { a, b }\n",
  })

  expect(run(dir, [bin('oxlint'), 'names.ts']).output).toContain('sort-imports')
})

test('oxlint react reports elements without children that are not self-closing', () => {
  const dir = project({
    'oxlint.config.ts': oxlintConfig(['base', 'react']),
    'view.tsx': 'export const View = () => <div></div>\n',
  })

  const result = run(dir, [bin('oxlint'), 'view.tsx'])
  expect(result.code).toBe(1)
  expect(result.output).toContain('self-closing-comp')
})

const source = `import { b } from './b'
import { shared } from '@/shared/ui'
import { app } from '@/app/store'
import x from 'npm:x'
import { readFile } from "node:fs";
import lib from 'lib'
export const all = [b, shared, app, x, readFile, lib]
`

test('oxfmt base formats and groups imports like the Biome preset', () => {
  const dir = project({
    'oxfmt.config.ts': oxfmtConfig(['base']),
    'a.ts': source,
  })

  expect(run(dir, [bin('oxfmt'), '--write', 'a.ts']).code).toBe(0)
  expect(readFileSync(join(dir, 'a.ts'), 'utf8'))
    .toBe(`import { readFile } from 'node:fs'

import lib from 'lib'

import x from 'npm:x'

import { app } from '@/app/store'
import { shared } from '@/shared/ui'

import { b } from './b'
export const all = [b, shared, app, x, readFile, lib]
`)
})

test('oxfmt fsd puts @/shared before other aliases', () => {
  const dir = project({
    'oxfmt.config.ts': oxfmtConfig(['base', 'fsd']),
    'a.ts': source,
  })

  expect(run(dir, [bin('oxfmt'), '--write', 'a.ts']).code).toBe(0)
  expect(readFileSync(join(dir, 'a.ts'), 'utf8')).toContain(
    "import { shared } from '@/shared/ui'\n\nimport { app } from '@/app/store'",
  )
})

test('oxfmt tailwind sorts classes inside cn()', () => {
  const dir = project({
    'oxfmt.config.ts': oxfmtConfig(['base', 'tailwind']),
    'a.ts': "export const c = cn('p-4 flex')\n",
  })

  expect(run(dir, [bin('oxfmt'), '--write', 'a.ts']).code).toBe(0)
  expect(readFileSync(join(dir, 'a.ts'), 'utf8')).toBe(
    "export const c = cn('flex p-4')\n",
  )
})
