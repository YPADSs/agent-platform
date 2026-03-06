#!/usr/bin/env node
/**
 * CI policy guards (Netlify-only, no secrets in repo).
 *
 * - Fail if forbidden files are present (e.g. committed .env, Vercel artifacts).
 * - Validate that .env.example contains only variable names with empty values.
 *
 * This is a lightweight, dependency-free check meant to run early in CI.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

const errors = [];

// 1) Forbid committing .env files (except .env.example).
const forbiddenExact = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  'vercel.json',
  'now.json',
];

for (const rel of forbiddenExact) {
  const abs = path.join(repoRoot, rel);
  if (exists(abs)) {
    errors.push(`Forbidden file present: ${rel} (do not commit secrets or Vercel config).`);
  }
}

// Forbid any other .env* files except .env.example
try {
  for (const entry of fs.readdirSync(repoRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    if (name === '.env.example') continue;
    if (name.startsWith('.env')) {
      errors.push(`Forbidden env file present: ${name} (only .env.example is allowed).`);
    }
  }
} catch (e) {
  errors.push(`Failed to scan repo root: ${e?.message ?? String(e)}`);
}

// Forbid Vercel directory
if (isDir(path.join(repoRoot, '.vercel'))) {
  errors.push('Forbidden directory present: .vercel (Vercel is forbidden; Netlify-only).');
}

// 2) Validate .env.example format (names only, empty values).
const envExamplePath = path.join(repoRoot, '.env.example');
if (!isFile(envExamplePath)) {
  errors.push('Missing .env.example (required for documenting env var names without secrets).');
} else {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const badLines = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // Must be NAME= with empty value
    if (!/^[A-Z0-9_]+=$/.test(line)) {
      badLines.push(`${i + 1}: ${raw}`);
      continue;
    }
  }
  if (badLines.length) {
    errors.push(
      `.env.example must contain only VAR_NAME= (empty values). Invalid lines:\n` +
      badLines.map(l => `  - ${l}`).join('\n')
    );
  }
}

// Report
if (errors.length) {
  console.error('\nCI policy guards failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  console.error('\nFix: remove forbidden files from the repo and keep only variable names (no values) in .env.example.\n');
  process.exit(1);
} else {
  console.log('CI policy guards: OK');
}
