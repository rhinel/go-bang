// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  plugins: ['html'],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // 末尾不要求分号
    'semi': [2, 'never'],
    // 变量或属性可以下划线
    'no-underscore-dangle': 0,
    // 数组不要求结构赋值
    'prefer-destructuring': ['error', { 'object': true, 'array': false }],
    // 可以进行参数赋值
    'no-param-reassign': 0,
    // 不校验换行符
    'linebreak-style': 0,
    // class 中可以不用 this
    'class-methods-use-this': 0,
    // allow alert
    'no-alert': 0
  }
}
