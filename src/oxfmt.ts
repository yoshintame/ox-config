import type { OxfmtConfig, SortImportsConfig } from 'oxfmt'

const imports = {
  groups: [
    'builtin',
    'external',
    'protocol',
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
    { groupName: 'url', elementNamePattern: ['https://**', 'http://**'] },
  ],
} satisfies SortImportsConfig

export const base: OxfmtConfig = {
  printWidth: 80,
  semi: false,
  singleQuote: true,
  sortImports: imports,
  ignorePatterns: ['CHANGELOG.md', '**/generated/**'],
}

export const fsd: OxfmtConfig = {
  sortImports: {
    ...imports,
    groups: imports.groups.flatMap((group) =>
      group === 'protocol' ? [group, 'shared'] : [group],
    ),
    customGroups: [
      ...imports.customGroups,
      { groupName: 'shared', elementNamePattern: ['@/shared/**'] },
    ],
  },
}

export const tailwind: OxfmtConfig = {
  sortTailwindcss: {
    functions: ['cn', 'clsx', 'cva', 'tw'],
  },
}
