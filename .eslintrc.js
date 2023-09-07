module.exports = {
  root: true,
  ignorePatterns: ['**/*'],
  plugins: ['@nx'],
  env: {
    browser: true,
    node: true,
    es6: true,
    es2017: true
  },
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['**/*.d.ts', '**/*.spec.ts'],
      extends: [
        'plugin:@nx/angular',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      plugins: [
        'eslint-plugin-import',
        '@angular-eslint/eslint-plugin',
        '@typescript-eslint'
      ],
      rules: {
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/no-floating-promises': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/no-misused-promises': 'warn',
        'no-async-promise-executor': 'warn',
        '@typescript-eslint/unbound-method': [
          'error',
          {
            ignoreStatic: true
          }
        ],
        'no-restricted-syntax': 'warn',
        '@typescript-eslint/member-ordering': 'off',
        '@angular-eslint/no-output-on-prefix': 'warn',
        '@angular-eslint/no-empty-lifecycle-method': 'warn'
      }
    }
  ]
};
