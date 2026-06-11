export default {
  // Frontend files
  'frontend/**/*.{js,jsx}': [
    'cd frontend && npx eslint --fix',
    'cd frontend && npx prettier --write',
  ],
  // Backend files
  'backend/**/*.{ts,tsx}': [
    'cd backend && npx eslint --fix',
    'cd backend && npx prettier --write',
  ],
  // Root level files
  '*.{json,md}': ['prettier --write'],
};