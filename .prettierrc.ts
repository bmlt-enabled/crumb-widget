import type { Config } from 'prettier';

/**
 * @see https://prettier.io/docs/configuration
 */
const config: Config = {
  jsxSingleQuote: true,
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  bracketSameLine: false,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'auto',
  trailingComma: 'none',
  printWidth: 200,
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte'
      }
    }
  ]
};

export default config;
