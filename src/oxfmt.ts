import type { OxfmtConfig } from 'oxfmt'

import { ignorePatterns } from './ignore-patterns.ts'

export interface OxfmtOptions {
  fsd?: boolean
  svelte?: boolean
  tailwind?: boolean
}

export const oxfmt = ({
  fsd = false,
  svelte = false,
  tailwind = false,
}: OxfmtOptions = {}): OxfmtConfig => ({
  printWidth: 80,
  semi: false,
  singleQuote: true,
  sortPackageJson: false,
  sortImports: {
    groups: [
      'builtin',
      'external',
      'protocol',
      ...(fsd ? ['shared'] : []),
      ['internal', 'subpath'],
      ['parent', 'sibling', 'index'],
      'url',
      'unknown',
    ],
    customGroups: [
      {
        groupName: 'protocol',
        elementNamePattern: ['npm:**', 'jsr:**', 'workspace:**'],
      },
      ...(fsd
        ? [{ groupName: 'shared', elementNamePattern: ['@/shared/**'] }]
        : []),
      { groupName: 'url', elementNamePattern: ['https://**', 'http://**'] },
    ],
  },
  ...(svelte && { svelte: true }),
  ...(tailwind && {
    sortTailwindcss: { functions: ['cn', 'clsx', 'cva', 'tw'] },
  }),
  ignorePatterns: ['CHANGELOG.md', ...ignorePatterns],
})
