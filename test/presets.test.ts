import { afterAll, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const dir = mkdtempSync(join(tmpdir(), 'ox-config-'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

writeFileSync(join(dir, 'a.tsx'), 'export const a = <div />\n')
writeFileSync(
  join(dir, 'jsx.d.ts'),
  'declare namespace JSX {\n  type Element = object\n  interface IntrinsicElements {\n    div: object\n  }\n}\n',
)
writeFileSync(
  join(dir, 'tsconfig.json'),
  JSON.stringify({ compilerOptions: { jsx: 'preserve', strict: true } }),
)
mkdirSync(join(dir, 'generated'))
writeFileSync(
  join(dir, 'generated', 'g.ts'),
  'export function f(a: number) {\n  a = 2\n  return a\n}\n',
)

const loads = (tool: 'oxlint' | 'oxfmt', config: string) => {
  writeFileSync(join(dir, `${tool}.config.ts`), config)
  const argv =
    tool === 'oxfmt' ? ['--check', 'a.tsx'] : ['a.tsx', 'generated/g.ts']
  const result = Bun.spawnSync(
    [join(root, 'node_modules', '.bin', tool), ...argv],
    {
      cwd: dir,
      env: {
        ...process.env,
        OXLINT_TSGOLINT_PATH: join(root, 'node_modules', '.bin', 'tsgolint'),
      },
    },
  )
  return result.exitCode
}

test.each([
  [['base']],
  [['base', 'react']],
  [['base', 'strict']],
  [['base', 'react', 'strict']],
])('oxlint loads %p', (presets) => {
  const code = loads(
    'oxlint',
    `import { ${presets.join(', ')}, ignorePatterns } from '${join(root, 'src/oxlint.ts')}'
export default { extends: [${presets.join(', ')}], ignorePatterns }
`,
  )
  expect(code).toBe(0)
})

test.each([[{}], [{ fsd: true, tailwind: true }]])(
  'oxfmt loads %p',
  (options) => {
    const code = loads(
      'oxfmt',
      `import { oxfmt } from '${join(root, 'src/oxfmt.ts')}'
export default oxfmt(${JSON.stringify(options)})
`,
    )
    expect(code).toBe(0)
  },
)
