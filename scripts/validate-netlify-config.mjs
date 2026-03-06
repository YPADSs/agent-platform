#!/usr/bin/env node
/**
 * Lightweight CI guards for Netlify-specific failures.
 * - Prevent toml parse failures from typographic Unicode characters.
 * - Check Netlify function files for syntax errors early.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function exitWithError(msg) {
  console.error(msg);
  process.exit(1);
}

// Typographic characters that have broken toml parsing in this repo.
const BAD_UNICODE_REGEX = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u2018\u2019\u201C\u201D\u00A0]/g;

// 1) netlify.toml character guard
const tomlPath = path.resolve('netlify.toml');
if (fs.existsSync(tomlPath)) {
  const content = fs.readFileSync(tomlPath, 'utf8');
  const matches = content.match(BAD_UNICODE_REGEX);
  if (matches && matches.length > 0) {
    exitWithError(
      `Error: netlify.toml contains typographic/non-ASCII characters that can break TOML parsing.
- File: ${tomlPath}
- First match: ${JSON.stringify(matches[0])}

Fix: replace unicode dashes/quotes/non-breaking spaces with plain ASCII '-' and '"' where appropriate.`
    );
  }
} else {
  console.warn('Warn: netlify.toml not found — skipping TOML guard.');
}

// 2) Netlify functions syntax check (fail early if broken)
const functDir = path.resolve('netlify', 'functions');
if (fs.existsSync(functDir)) {
  const files = fs
    .readdirSync(functDir)
    .filter((f) => f.endsWith('.mjs') || f.endsWith('.js') || f.endsWith('.ts'));
  for (const f of files) {
    const fp = path.join(functDir, f);
    const result = spawnSync(process.execPath, ['--check', fp], { encoding: 'utf8' });
    if (result.status !== 0) {
      exitWithError(`Error: Netlify function syntax check failed for ${fp}
${result.stderr || result.stdout}`);
    }
  }
}

console.log('OK: Netlify config guards passed.');
