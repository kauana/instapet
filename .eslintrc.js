module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  rules: {
    'no-await-in-loop': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-console': 'off',
  },
};
