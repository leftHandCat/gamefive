module.exports = {
  root: true,
  globals: { // global 模式会忽略
    __NODE_ENV__: true
  },
  env: { // 语法
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  // 'off'   / 0   不启用
  // 'warn'  / 1   警告
  // 'error' / 2   报错
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-return-assign': 0,
    'no-unneed': 0,
    'no-var': 2,
    'object-curly-spacing': 0,
    'camelcase': 0,
    'comma-dangle': 0,
    'eqeqeq': 0,
    'operator-linebreak': 0,
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
