module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  rules: {
    'react/prop-types': ['error', { ignore: ['navigation', 'tintColor'] }],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'no-console': 'off',
  },
};
