module.exports = {
  'extends': 'airbnb-base',
  'rules': {
    'linebreak-style': [
      2,
      'unix'
    ],
    'quotes': [
      2,
      'single'
    ],
    // 对象数组个数
    'object-curly-newline': [2, {
      'ObjectExpression': {
        'multiline': true,
        'minProperties': 3
      },
      'ObjectPattern': {
        'multiline': true,
        'minProperties': 3
      },
      'ImportDeclaration': {
        'multiline': true,
        'minProperties': 3
      },
      'ExportDeclaration': {
        'multiline': true,
        'minProperties': 3
      }
    }],
    'prefer-destructuring': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'no-console': 0,
    'no-param-reassign': 0,
    'no-unreachable': 0,
    'valid-jsdoc': 2,
    'key-spacing': [2, {
      'beforeColon': false,
      'afterColon': true,
      'align': 'colon'
    }],
    'no-multi-spaces': 0,
    'sort-vars': [0, {
      'ignoreCase': true
    }],
    'consistent-return': 0,
    'no-underscore-dangle': 0
  }
};
