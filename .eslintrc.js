module.exports = {
  "extends": "airbnb-base",
  "rules": {
    "object-curly-newline": ["error", {
      "ObjectExpression": {
        "multiline": true,
        "minProperties": 3
      },
      "ObjectPattern": {
        "multiline": true,
        "minProperties": 3
      },
      "ImportDeclaration": {
        "multiline": true,
        "minProperties": 3
      },
      "ExportDeclaration": {
        "multiline": true,
        "minProperties": 3
      }
    }],
    "prefer-destructuring": "off",
    "no-restricted-syntax": [
      "error",
      "BinaryExpression[operator='in']"
    ],
    "no-continue": "off",
    "no-console": "off",
    "no-param-reassign": "off",
  }
};
