import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const files = execFileSync('git', ['ls-files', 'src', 'scripts'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((file) => file.endsWith('.js') || file.endsWith('.mjs'));

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /refreshToken\s*[:=]/i, `${file}: refresh token must not be stored in source`);
  assert.doesNotMatch(source, /console\.log\((?=.*token)/i, `${file}: token logging is forbidden`);
}

console.log(`Lint passed for ${files.length} files.`);
