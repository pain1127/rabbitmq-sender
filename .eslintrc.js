module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true,
    'mocha': true,
  },
  'extends': ['eslint:recommended', 'google'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'parser': 'babel-eslint',
  },
  'rules': {
    'max-len': ['error', {'code': 250}],
    'linebreak-style': [0, 'error', 'unix'],
  },
};
