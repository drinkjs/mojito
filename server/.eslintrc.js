module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    PromiseRes: true,
    IResult: true,
    ExceptionFilter: true,
    RouterContext: true,
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["./"],
      },
    },
  },
  extends: ["standard"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/no-unresolved": [0],
    "import/extensions": [0],
    "class-methods-use-this": [0],
    "no-param-reassign": [1],
    "import/prefer-default-export": [0],
    quotes: [0],
    "object-curly-newline": [0],
    "no-underscore-dangle": [0],
    "no-plusplus": [0],
    "no-restricted-syntax": [0],
    "comma-dangle": [0],
    semi: [0],
  },
};
