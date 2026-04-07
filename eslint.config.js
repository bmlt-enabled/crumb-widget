import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser
            }
        }
    },
    // Handle .svelte.ts rune files
    {
        files: ['**/*.svelte.ts'],
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: ts.parser
            }
        }
    },
    {
        ignores: ['build/', 'dist/', '*.md']
    },
    {
        files: ['**/*.ts', '**/*.svelte', '**/*.svelte.ts'],
        rules: {
            'no-undef': 'off',
            '@typescript-eslint/no-unused-vars': [
              'error',
              {
                'args': 'all',
                'argsIgnorePattern': '^_',
                'caughtErrors': 'all',
                'caughtErrorsIgnorePattern': '^_',
                'destructuredArrayIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'ignoreRestSiblings': true
              }
            ]
        }
    }
];
