import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      // Variables and imports
      'no-unused-vars': ['error', { 
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      'no-undef': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      
      // Code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-empty-function': 'warn',
      'no-magic-numbers': ['warn', { 
        ignore: [0, 1, -1, 2, 10, 100, 1000],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        ignoreClassFieldInitialValues: true
      }],
      
      // Style rules
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'space-before-blocks': 'error',
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'camelcase': ['error', { properties: 'never', ignoreImports: true }],
      'consistent-this': ['error', 'self'],
      'eol-last': 'error',
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'error',
      'no-return-await': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-confusing-arrow': ['error', { allowParens: true }],
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'no-useless-constructor': 'error',
      'no-duplicate-case': 'error',
      'default-case': 'error',
      'no-fallthrough': 'error',
      
      // Function rules
      'func-call-spacing': ['error', 'never'],
      'no-extra-parens': ['error', 'functions'],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      
      // Object rules
      'dot-notation': 'error',
      'no-prototype-builtins': 'error',
      'prefer-object-spread': 'error',
      
      // Array rules
      'array-callback-return': 'error',
      'prefer-destructuring': ['error', {
        array: false,
        object: true
      }, {
        enforceForRenamedProperties: false
      }],
      
      // Error handling
      'handle-callback-err': 'error',
      'no-process-exit': 'error',
      
      // Security
      'no-script-url': 'error',
      'no-new-require': 'error',
      'no-path-concat': 'error',
      
      // Additional import/export rules
      'no-self-import': 'error',
      'no-useless-rename': 'error',
      
      // Async/await best practices
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'no-promise-executor-return': 'error',
      
      // Regular expressions
      'no-invalid-regexp': 'error',
      'no-regex-spaces': 'error',
      
      // Comments
      'spaced-comment': ['error', 'always', {
        exceptions: ['-', '=', '*'],
        markers: ['/', '!', '*']
      }],
    },
  },
  {
    // Ignore common directories and files
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      '*.config.js',
      'babel.config.js',
      'webpack.config.js',
      'rollup.config.js',
      'vite.config.js',
      '.env*',
    ],
  },
];
