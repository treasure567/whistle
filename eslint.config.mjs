import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import vitestPlugin from '@vitest/eslint-plugin';
import markdown from '@eslint/markdown';
import jsoncParser from 'jsonc-eslint-parser';

const noEmDash = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow em dash (U+2014); use commas, periods, colons, or parentheses.',
    },
    messages: {
      found: 'Em dash (U+2014) is forbidden. Use a comma, period, colon, or parentheses.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        const text = context.sourceCode.getText();
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const idx = lines[i].indexOf('—');
          if (idx !== -1) {
            context.report({ loc: { line: i + 1, column: idx }, messageId: 'found' });
          }
        }
      },
    };
  },
};

const noLooseVersionPins = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow ^ or ~ in package.json version pins.' },
    messages: { found: 'Version pin {{value}} uses {{prefix}}; pin to an exact version.' },
    schema: [],
  },
  create(context) {
    if (!context.filename.endsWith('package.json')) return {};
    const depBlockKeys = /^(dependencies|devDependencies|peerDependencies|optionalDependencies)$/;
    return {
      'JSONProperty[value.type="JSONObjectExpression"]'(node) {
        const { key } = node;
        if (key.type !== 'JSONLiteral' || typeof key.value !== 'string' || !depBlockKeys.test(key.value)) {
          return;
        }
        const { value } = node;
        if (value.type !== 'JSONObjectExpression') return;
        for (const dep of value.properties) {
          if (dep.type !== 'JSONProperty') continue;
          if (dep.value.type !== 'JSONLiteral' || typeof dep.value.value !== 'string') continue;
          const v = dep.value.value;
          if (v.startsWith('^') || v.startsWith('~')) {
            context.report({ node: dep.value, messageId: 'found', data: { value: v, prefix: v[0] } });
          }
        }
      },
    };
  },
};

const noDirectProcessEnv = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow direct process.env access outside @whistle/config.' },
    messages: { found: 'Read env via @whistle/config, not process.env directly.' },
    schema: [],
  },
  create(context) {
    if (
      context.filename.includes('packages/config/src/') ||
      context.filename.includes('/tests/') ||
      context.filename.endsWith('.test.ts')
    ) {
      return {};
    }
    return {
      'MemberExpression[object.name="process"][property.name="env"]'(node) {
        context.report({ node, messageId: 'found' });
      },
    };
  },
};

const whistleInternal = {
  rules: {
    'no-em-dash': noEmDash,
    'no-loose-version-pins': noLooseVersionPins,
    'no-direct-process-env': noDirectProcessEnv,
  },
};

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'whistle-internal': whistleInternal,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-undef': 'off',
      'no-redeclare': 'off',
      'whistle-internal/no-em-dash': 'error',
      'whistle-internal/no-direct-process-env': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'xxx'], location: 'start' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/package.json'],
    languageOptions: { parser: jsoncParser },
    plugins: { 'whistle-internal': whistleInternal },
    rules: { 'whistle-internal/no-loose-version-pins': 'error' },
  },
  {
    files: ['**/*.md'],
    plugins: { markdown, 'whistle-internal': whistleInternal },
    processor: 'markdown/markdown',
    rules: { 'whistle-internal/no-em-dash': 'error' },
  },
  {
    files: ['**/*.test.ts', '**/tests/**'],
    plugins: { vitest: vitestPlugin },
    rules: {
      ...(vitestPlugin.configs?.recommended?.rules ?? {}),
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/prisma/client/**',
      '**/.prisma/**',
      '**/src/abis/**',
      '**/tests/**/*.js',
      '**/tests/**/*.d.ts',
    ],
  },
];
