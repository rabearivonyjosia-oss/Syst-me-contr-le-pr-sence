import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Les contextes exposent volontairement leur hook de consommation à
      // côté du provider : ce sont deux exports stables, pas des composants
      // additionnels, et le rechargement à chaud reste fonctionnel.
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['useAuth', 'useToast'] },
      ],
    },
  },
])
