# @yoshintame/ox-config

Shared [oxlint](https://oxc.rs/docs/guide/usage/linter) and [oxfmt](https://oxc.rs/docs/guide/usage/formatter) presets, the successor of `@yoshintame/biome-config`.

```sh
bun add -d @yoshintame/ox-config oxlint oxfmt
```

| Export                         | Preset     | Contents                                                                                                                                  |
| ------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `@yoshintame/ox-config/oxlint` | `base`     | `correctness` and `suspicious` categories, the rules carried over from the Biome preset, sorted names inside `{ … }`                      |
|                                | `react`    | react plugin, self-closing elements                                                                                                       |
| `@yoshintame/ox-config/oxfmt`  | `base`     | single quotes, no semicolons, 80 columns, import groups: builtin, packages, `npm:` / `jsr:` / `workspace:`, aliases, relative paths, URLs |
|                                | `fsd`      | `@/shared/**` as its own group before the other aliases                                                                                   |
|                                | `tailwind` | Tailwind class sorting in `class`, `className`, `cn`, `clsx`, `cva`, `tw`                                                                 |

`oxlint.config.ts`:

```ts
import { base, react } from '@yoshintame/ox-config/oxlint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base, react],
  rules: {},
})
```

`oxfmt.config.ts` has no `extends`, so the presets are spread; `fsd` and `tailwind` hold only their differences from `base` and go after it:

```ts
import { base, fsd, tailwind } from '@yoshintame/ox-config/oxfmt'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...base, ...fsd, ...tailwind })
```

Both tools load TypeScript configs through Node.js 22.18+ or 24+.

## Differences from the Biome preset

- oxfmt sorts import declarations but not the names inside `{ … }`; the oxlint `sort-imports` rule reports and fixes them, export lists stay unsorted.
- oxfmt resolves no `tsconfig.json` paths: aliases other than `~/`, `@/` and `#` go to `sortImports.internalPattern`.
- `noUnusedTemplateLiteral` has no equivalent; `unicorn/filename-case` has no ASCII-only option; Tailwind sorting matches function names exactly, so `tw.*` is gone; the Biome `react` preset is split into the oxlint `react` and the oxfmt `tailwind` presets.
- oxfmt also formats JSON, YAML, TOML and Markdown and sorts `package.json` keys.
