/**
 * Drops empty-string CI — Expo getenv.boolish('CI') throws on CI="".
 */
const { spawnSync } = require('child_process');
const path = require('path');

const expoCli = path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli');
const env = { ...process.env };
if (typeof env.CI === 'string' && env.CI.trim() === '') {
  delete env.CI;
}

const args = process.argv.slice(2);
const r = spawnSync('node', [expoCli, ...args], { env, stdio: 'inherit' });
process.exit(typeof r.status === 'number' ? r.status : 1);
