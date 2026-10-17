import { defineConfig } from 'oxlint'

import { base, ignorePatterns, strict } from './src/oxlint.ts'

export default defineConfig({ extends: [base, strict], ignorePatterns })
