import type { OxlintConfig } from 'oxlint'

export { ignorePatterns } from './ignore-patterns.ts'

const testFiles = ['**/*.{test,spec}.*']

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
    'import/no-cycle': 'error',
    'import/no-unassigned-import': 'off',
    'no-array-constructor': 'error',
    'no-else-return': 'error',
    'no-param-reassign': 'error',
    'no-shadow': 'off',
    'one-var': ['error', 'never'],
    'sort-imports': [
      'error',
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    'typescript/ban-ts-comment': ['error', { 'ts-expect-error': false }],
    'typescript/consistent-return': 'off',
    'typescript/no-dynamic-delete': 'error',
    'typescript/no-empty-object-type': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/no-inferrable-types': 'error',
    'typescript/no-invalid-void-type': 'error',
    'typescript/no-namespace': 'error',
    'typescript/no-non-null-asserted-nullish-coalescing': 'error',
    'typescript/no-non-null-assertion': 'error',
    'typescript/no-require-imports': 'error',
    'typescript/no-unsafe-function-type': 'error',
    'typescript/no-unsafe-type-assertion': 'off',
    'typescript/prefer-enum-initializers': 'error',
    'typescript/prefer-literal-enum-member': 'error',
    'typescript/unified-signatures': 'error',
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/prefer-number-properties': 'error',
  },
  overrides: [
    {
      files: testFiles,
      rules: {
        'typescript/no-dynamic-delete': 'off',
        'typescript/no-non-null-assertion': 'off',
      },
    },
  ],
}

export const strict: OxlintConfig = {
  options: {
    typeAware: true,
  },
  rules: {
    'typescript/no-confusing-void-expression': [
      'error',
      { ignoreArrowShorthand: true },
    ],
    'typescript/no-deprecated': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-mixed-enums': 'error',
    'typescript/no-unnecessary-condition': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/only-throw-error': 'error',
    'typescript/prefer-promise-reject-errors': 'error',
    'typescript/prefer-reduce-type-parameter': 'error',
    'typescript/prefer-return-this-type': 'error',
    'typescript/related-getter-setter-pairs': 'error',
    'typescript/require-await': 'error',
    'typescript/restrict-plus-operands': [
      'error',
      {
        allowAny: false,
        allowBoolean: false,
        allowNullish: false,
        allowNumberAndString: false,
        allowRegExp: false,
      },
    ],
    'typescript/restrict-template-expressions': [
      'error',
      {
        allowAny: false,
        allowBoolean: false,
        allowNever: false,
        allowNullish: false,
        allowRegExp: false,
      },
    ],
    'typescript/return-await': ['error', 'error-handling-correctness-only'],
    'typescript/strict-boolean-expressions': [
      'error',
      { allowNullableString: true },
    ],
    'typescript/switch-exhaustiveness-check': 'error',
    'typescript/use-unknown-in-catch-callback-variable': 'error',
  },
  overrides: [
    {
      files: testFiles,
      rules: {
        'typescript/no-unsafe-argument': 'off',
        'typescript/no-unsafe-assignment': 'off',
        'typescript/unbound-method': 'off',
      },
    },
  ],
}

export const react: OxlintConfig = {
  plugins: ['react'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',
  },
}

export const vitest: OxlintConfig = {
  plugins: ['vitest'],
  rules: {
    'vitest/require-mock-type-parameters': 'off',
  },
}
