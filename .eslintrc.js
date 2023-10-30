module.exports = {
    env: {
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'airbnb'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        'arrow-parens': 'off',
        indent: 'off',
        'linebreak-style': 'off',
        semi: 'off',
        'max-len': 'off',
        'comma-dangle': 'off',
        'object-curly-newline': 'off',
        'operator-linebreak': 'off',
        'no-trailing-spaces': 'off',
        'no-return-await': 'off',
        'no-underscore-dangle': 'off',
        'implicit-arrow-linebreak': 'off',
        'function-paren-newline': 'off',
        'no-console': 'off',
        'import/prefer-default-export': 'off',
        'no-case-declarations': 'off',
        'no-param-reassign': 'off',
        'default-param-last': 'off',
        'no-return-assign': 'off',
        'no-inner-declarations': 'off',
        'no-nested-ternary': 'off',
        'no-unused-expressions': 'off',
        'no-alert': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'import/extensions': 'off',
        'no-plusplus': 'off',
        'no-unused-vars': 'warn',
        'no-bitwise': 'off',
        eqeqeq: 'off',
        'consistent-return': 'off',
        'no-await-in-loop': 'off',
        'no-restricted-syntax': 'off',
        'arrow-body-style': 'off',
        'no-new': 'off',
        'import/no-unresolved': 'off'
    }
}
