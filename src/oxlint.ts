import type { OxlintConfig } from 'oxlint'

export { ignorePatterns } from './ignore-patterns.ts'

export const base: OxlintConfig = {
  plugins: ['typescript', 'unicorn', 'oxc', 'import'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  options: {
    denyWarnings: true,
    reportUnusedDisableDirectives: 'error',
  },
  rules: {
    'default-param-last': 'error',
    'import/no-unassigned-import': 'off',
    'no-else-return': 'error',
    'no-param-reassign': 'error',
    'no-shadow': 'off',
    'one-var': ['error', 'never'],
    'sort-imports': [
      'error',
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    'typescript/no-inferrable-types': 'error',
    'typescript/prefer-as-const': 'error',
    'typescript/prefer-enum-initializers': 'error',
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/prefer-number-properties': 'error',
  },
}

export const react: OxlintConfig = {
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',
  },
}
