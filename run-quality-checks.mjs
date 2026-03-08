import { spawnSync } from 'node:child_process';

const steps = [
  { name: 'Formatting', command: 'npm run format' },
  { name: 'Lint', command: 'npm run lint' },
  { name: 'Typecheck', command: 'npm run typecheck' },
  { name: 'Tests', command: 'npm run test' },
];

const results = [];

for (const step of steps) {
  console.log(`\n=== ${step.name}: ${step.command} ===`);

  const run = spawnSync(step.command, {
    stdio: 'inherit',
    shell: true,
  });

  const success = run.status === 0;
  results.push({ name: step.name, success });
}

console.log('\n=== Summary ===');
for (const result of results) {
  if (result.success) {
    console.log(`[%c✓%c] ${result.name}`, 'color: green;', 'color: default;');
  } else {
    console.log(
      `[%c✗%c] ${result.name} Failed`,
      'color: red;',
      'color: default;',
    );
  }
}

const hasFailures = results.some((result) => !result.success);
if (hasFailures) {
  process.exitCode = 1;
}
