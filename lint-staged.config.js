module.exports = {
  '*.{ts,js}': ['eslint --fix', 'git add'],
  '*.{json,md,yaml,yml}': ['prettier --write', 'git add'],
  '{.eslintrc}': ['prettier --write', 'git add'],
};
