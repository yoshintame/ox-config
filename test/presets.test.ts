import { afterAll, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const dir = mkdtempSync(join(tmpdir(), 'ox-config-'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

writeFileSync(join(dir, 'a.tsx'), 'export const a = <div />\n')

const loads = (tool: 'oxlint' | 'oxfmt', config: string) => {
  writeFileSync(join(dir, `${tool}.config.ts`), config)
  const argv = tool === 'oxfmt' ? ['--check', 'a.tsx'] : ['a.tsx']
  const result = Bun.spawnSync(
    [join(root, 'node_modules', '.bin', tool), ...argv],
    { cwd: dir },
  )
  return result.exitCode
}

test.each([[['base']], [['base', 'react']]])('oxlint loads %p', (presets) => {
  const code = loads(
    'oxlint',
    `import { ${presets.join(', ')} } from '${join(root, 'src/oxlint.ts')}'
export default { extends: [${presets.join(', ')}] }
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
