module.exports = {
  extends: ['airbnb-base'],

  globals: {
    it: true,
    xit: true,
    describe: true,
  },

  rules: {
    semi: 0,
    'func-names': ['error', 'always'],
    'no-constant-condition': 0,
  }
}
