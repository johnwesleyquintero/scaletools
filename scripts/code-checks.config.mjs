/**
 * Configuration for the code-checker script.
 * Define the commands to run and their descriptive names.
 */
export const CHECKS = [
  { command: 'npx eslint .', name: 'Lint & Format Check' },
  { command: 'npm run typecheck', name: 'Type Check' },
  //{ command: 'npm run build', name: 'Build Check' },
];
