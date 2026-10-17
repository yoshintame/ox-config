import { afterAll, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { base, strict } from '../src/oxlint.ts'

interface RuleInfo {
  scope: string
  value: string
  type_aware: boolean
}

const root = resolve(import.meta.dir, '..')
const bin = (tool: string) => join(root, 'node_modules', '.bin', tool)
const dir = mkdtempSync(join(tmpdir(), 'ox-config-'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

const relaxedInTests = `const methods = { size: () => 1, count() { return 1 } }
export const count = methods.count
export const first = [methods.size()].at(0)!
`

writeFileSync(join(dir, 'a.tsx'), 'export const a = <div />\n')
writeFileSync(
  join(dir, 'jsx.d.ts'),
  `declare namespace JSX {
  type Element = object
  interface IntrinsicElements {
    div: object
  }
}
`,
)
writeFileSync(
  join(dir, 'tsconfig.json'),
  JSON.stringify({ compilerOptions: { jsx: 'preserve', strict: true } }),
)
writeFileSync(
  join(dir, 'floating.ts'),
  `export function load(): Promise<number> {
  return Promise.resolve(1)
}
load()
`,
)
writeFileSync(join(dir, 'relaxed.ts'), relaxedInTests)
writeFileSync(join(dir, 'relaxed.test.ts'), relaxedInTests)
mkdirSync(join(dir, 'generated'))
writeFileSync(
  join(dir, 'generated', 'g.ts'),
  `export function f(a: number) {
  a = 2
  return a
}
`,
)

const useOxlintPresets = (presets: string[]) =>
  writeFileSync(
    join(dir, 'oxlint.config.ts'),
    `import { ${presets.join(', ')}, ignorePatterns } from '${join(root, 'src/oxlint.ts')}'
export default { extends: [${presets.join(', ')}], ignorePatterns }
`,
  )

const lint = (files: string[]) =>
  Bun.spawnSync([bin('oxlint'), ...files], {
    cwd: dir,
    env: { ...process.env, OXLINT_TSGOLINT_PATH: bin('tsgolint') },
  })

const typeAware = new Map(
  (
    JSON.parse(
      Bun.spawnSync([
        bin('oxlint'),
        '--rules',
        '--format',
        'json',
      ]).stdout.toString(),
    ) as RuleInfo[]
  ).map(({ scope, value, type_aware }) => [
    scope === 'eslint' ? value : `${scope}/${value}`,
    type_aware,
  ]),
)

const isOff = (setting: unknown) =>
  (Array.isArray(setting) ? setting[0] : setting) === 'off'

test.each([
  [['base']],
  [['base', 'react']],
  [['base', 'strict']],
  [['base', 'react', 'strict']],
])('oxlint loads %p', (presets) => {
  useOxlintPresets(presets)
  expect(lint(['a.tsx', 'generated/g.ts']).exitCode).toBe(0)
})

test('strict runs type-aware rules and relaxes them in test files', () => {
  useOxlintPresets(['base', 'strict'])
  expect(lint(['floating.ts']).stdout.toString()).toContain(
    'no-floating-promises',
  )
  expect(lint(['relaxed.ts']).stdout.toString()).toContain('unbound-method')
  expect(lint(['relaxed.ts']).stdout.toString()).toContain(
    'no-non-null-assertion',
  )
  expect(lint(['relaxed.test.ts']).exitCode).toBe(0)
})

test('base enables only rules that need no type information', () => {
  const enabled = [
    ...Object.entries(base.rules ?? {})
      .filter(([, setting]) => !isOff(setting))
      .map(([name]) => name),
    ...(base.overrides ?? []).flatMap(({ rules }) => Object.keys(rules ?? {})),
  ]
  expect(enabled.filter((name) => typeAware.get(name) !== false)).toEqual([])
})

test('strict holds only type-aware rules', () => {
  const names = [
    ...Object.keys(strict.rules ?? {}),
    ...(strict.overrides ?? []).flatMap(({ rules }) =>
      Object.keys(rules ?? {}),
    ),
  ]
  expect(names.filter((name) => typeAware.get(name) !== true)).toEqual([])
})

test.each([[{}], [{ fsd: true, tailwind: true }]])(
  'oxfmt loads %p',
  (options) => {
    writeFileSync(
      join(dir, 'oxfmt.config.ts'),
      `import { oxfmt } from '${join(root, 'src/oxfmt.ts')}'
export default oxfmt(${JSON.stringify(options)})
`,
    )
    expect(
      Bun.spawnSync([bin('oxfmt'), '--check', 'a.tsx'], { cwd: dir }).exitCode,
    ).toBe(0)
  },
)
