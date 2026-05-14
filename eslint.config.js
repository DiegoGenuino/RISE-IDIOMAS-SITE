import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      // Bloqueia console.log e debugger em produção
      'no-console': 'error',
      'no-debugger': 'error',

      // Boas práticas
      'no-unused-vars': 'off', // desligado pra não conflitar com o do TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Ignora arquivos de config e build
    ignores: ['dist/**', '.astro/**', 'node_modules/**', '.vercel/**', '.vscode/**'],
  },
];
