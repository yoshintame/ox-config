import type {
  CustomGroupItemConfig,
  OxfmtConfig,
  SortGroupItemConfig,
} from 'oxfmt'

export interface OxfmtOptions {
  fsd?: boolean
  tailwind?: boolean
}

const groups = (fsd: boolean): SortGroupItemConfig[] => [
  'builtin',
  'external',
  'protocol',
  ...(fsd ? ['shared'] : []),
  ['internal', 'subpath'],
  ['parent', 'sibling', 'index'],
  'url',
  'unknown',
]

const customGroups = (fsd: boolean): CustomGroupItemConfig[] => [
  {
    groupName: 'protocol',
    elementNamePattern: ['npm:**', 'jsr:**', 'workspace:**'],
  },
  ...(fsd
    ? [{ groupName: 'shared', elementNamePattern: ['@/shared/**'] }]
    : []),
  { groupName: 'url', elementNamePattern: ['https://**', 'http://**'] },
]

export const oxfmt = ({
  fsd = false,
  tailwind = false,
}: OxfmtOptions = {}): OxfmtConfig => ({
  printWidth: 80,
  semi: false,
  singleQuote: true,
  sortImports: { groups: groups(fsd), customGroups: customGroups(fsd) },
  ...(tailwind && {
    sortTailwindcss: { functions: ['cn', 'clsx', 'cva', 'tw'] },
  }),
  ignorePatterns: ['CHANGELOG.md', '**/generated/**'],
})
