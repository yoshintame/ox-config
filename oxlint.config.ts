import { defineConfig } from 'oxlint'

import { base, ignorePatterns } from './src/oxlint.ts'

export default defineConfig({ extends: [base], ignorePatterns })
