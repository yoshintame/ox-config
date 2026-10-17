# @yoshintame/ox-config

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) presets, the successor of `@yoshintame/biome-config`.

```sh
bun add -d @yoshintame/ox-config oxlint oxfmt
```

| Export                         | Contents                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `@yoshintame/ox-config/oxlint` | `base`: `correctness` and `suspicious` categories, the rules carried over from the Biome preset, sorted names inside `{ … }` |
|                                | `react`: react plugin, self-closing elements, no React import for JSX                                                        |
| `@yoshintame/ox-config/oxfmt`  | `oxfmt(options)`: single quotes, no semicolons, 80 columns, import groups, `CHANGELOG.md` and `**/generated/**` ignored      |

`oxlint.config.ts`:

```ts
import { base, ignorePatterns, react } from '@yoshintame/ox-config/oxlint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base, react],
  ignorePatterns,
  rules: {},
})
```

oxlint does not inherit `ignorePatterns` through `extends`, so the shared list (`**/generated/**`) is spread into the project config itself.

`oxfmt.config.ts`:

```ts
import { oxfmt } from '@yoshintame/ox-config/oxfmt'
import { defineConfig } from 'oxfmt'

export default defineConfig(oxfmt({ fsd: true, tailwind: true }))
```

| Option     | Default | Effect                                                                    |
| ---------- | ------- | ------------------------------------------------------------------------- |
| `fsd`      | `false` | `@/shared/**` as its own import group before the other aliases            |
| `tailwind` | `false` | Tailwind class sorting in `class`, `className`, `cn`, `clsx`, `cva`, `tw` |

Import groups, each separated by a blank line: builtin modules, packages, `npm:` / `jsr:` / `workspace:`, aliases (`~/`, `@/`, `#`, subpath imports), relative paths, URLs.

Both tools load TypeScript configs through Node.js 22.18+ or 24+.

[Vite+](https://viteplus.dev) reads the same objects from the `lint` and `fmt` blocks of `vite.config.ts` (not yet tried in a project):

```ts
import { oxfmt } from '@yoshintame/ox-config/oxfmt'
import { base, ignorePatterns, react } from '@yoshintame/ox-config/oxlint'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: { extends: [base, react], ignorePatterns },
  fmt: oxfmt({ tailwind: true }),
})
```

## Differences from the Biome preset

- oxfmt sorts import declarations but not the names inside `{ … }`; the oxlint `sort-imports` rule reports and fixes them, export lists stay unsorted.
- oxfmt resolves no `tsconfig.json` paths: aliases other than `~/`, `@/` and `#` go to `sortImports.internalPattern`.
- `noUnusedTemplateLiteral` has no equivalent; `unicorn/filename-case` has no ASCII-only option; Tailwind sorting matches function names exactly, so `tw.*` is gone; the Biome `react` preset is split into the oxlint `react` preset and the oxfmt `tailwind` option.
- oxfmt also formats JSON, YAML, TOML and Markdown, including code blocks inside Markdown; put `<!-- prettier-ignore -->` before a block that must stay verbatim. Its `package.json` key sorting is off: the order is fixed and puts `scripts` and dependencies far down.

## Development

`mise install`, `bun install`, then `hk install --mise` once per clone for the git hooks.
