module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "object-curly-spacing": [
      "error",
      "never"
    ],
    "block-spacing": [
      "error",
      "never"
    ],
    "keyword-spacing": [
      "error",
      {
        "overrides": {
          "for": {
            "after": false
          }
        }
      }
    ],
    "space-before-function-paren": [
      "error",
      "never"
    ],
    "indent": [
      "error",
      2
    ],
    "no-tabs": 0
  }
}
