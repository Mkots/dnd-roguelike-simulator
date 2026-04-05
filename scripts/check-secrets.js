#!/usr/bin/env node
/**
 * Scans Git-staged files for common secret patterns before a commit.
 *
 * Run:  node scripts/check-secrets.js
 * Exit 0 → no secrets detected
 * Exit 1 → potential secrets found (prints file + line)
 *
 * Checks for:
 *  - Private key / certificate blocks (PEM headers)
 *  - Generic high-signal token assignment patterns
 *  - Well-known prefixes: GitHub PAT, AWS keys, Stripe, Twilio, SendGrid, etc.
 *  - .env files accidentally staged
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Patterns that strongly suggest a real secret value.
// Each entry: { name, regex }
const PATTERNS = [
  // PEM blocks
  { name: 'PEM private key', regex: /-----BEGIN\s+(RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/ },
  { name: 'PEM certificate',  regex: /-----BEGIN CERTIFICATE-----/ },

  // Cloud & service tokens with known prefixes
  { name: 'GitHub PAT (classic)',   regex: /\bghp_[A-Za-z0-9]{36,}\b/ },
  { name: 'GitHub PAT (fine-grained)', regex: /\bgithub_pat_[A-Za-z0-9_]{80,}\b/ },
  { name: 'GitHub Actions token',   regex: /\bghs_[A-Za-z0-9]{36,}\b/ },
  { name: 'AWS access key ID',      regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'AWS secret access key',  regex: /aws[_\-.]?secret[_\-.]?access[_\-.]?key\s*[:=]\s*["']?[A-Za-z0-9/+]{40}["']?/i },
  { name: 'Stripe secret key',      regex: /\bsk_(live|test)_[A-Za-z0-9]{24,}\b/ },
  { name: 'Stripe publishable key', regex: /\bpk_(live|test)_[A-Za-z0-9]{24,}\b/ },
  { name: 'Twilio account SID',     regex: /\bAC[0-9a-fA-F]{32}\b/ },
  { name: 'Twilio auth token',      regex: /twilio[_\-.]?auth[_\-.]?token\s*[:=]\s*["']?[0-9a-fA-F]{32}["']?/i },
  { name: 'SendGrid API key',       regex: /\bSG\.[A-Za-z0-9_\-.]{22,}\.[A-Za-z0-9_\-.]{43,}\b/ },
  { name: 'Slack token',            regex: /\bxox[baprs]-[0-9A-Za-z\-]{10,}\b/ },
  { name: 'Slack webhook',          regex: /hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+/ },
  { name: 'Google API key',         regex: /\bAIza[0-9A-Za-z_\-]{35}\b/ },
  { name: 'Firebase config',        regex: /\bAAAA[A-Za-z0-9_\-]{7}:[A-Za-z0-9_\-]{140}\b/ },
  { name: 'JWT token',              regex: /\beyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\b/ },
  { name: 'npm auth token',         regex: /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*\S+/ },

  // Generic high-signal assignment patterns
  { name: 'password assignment',    regex: /(?<!\w)password\s*[:=]\s*["'][^"']{6,}["']/i },
  { name: 'secret assignment',      regex: /(?<!\w)secret\s*[:=]\s*["'][^"']{6,}["']/i },
  { name: 'api_key assignment',     regex: /(?<!\w)api[_\-.]?key\s*[:=]\s*["'][^"']{6,}["']/i },
  { name: 'auth_token assignment',  regex: /(?<!\w)auth[_\-.]?token\s*[:=]\s*["'][^"']{6,}["']/i },
  { name: 'access_token assignment',regex: /(?<!\w)access[_\-.]?token\s*[:=]\s*["'][^"']{6,}["']/i },
];

// File patterns that should never be staged.
const FORBIDDEN_FILES = [
  /^\.env$/,
  /^\.env\.[^.]+$/,       // .env.production, .env.staging, etc.
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.pfx$/,
  /id_rsa/,
  /id_ed25519/,
  /id_ecdsa/,
  /id_dsa/,
];

// Binary file extensions to skip content scanning.
const BINARY_EXT = new Set([
  'png','jpg','jpeg','gif','webp','ico','svg',
  'woff','woff2','ttf','eot',
  'mp3','mp4','ogg','wav',
  'zip','gz','tar','7z',
  'pdf','docx','xlsx',
  'exe','dll','so','dylib',
]);

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    // Not inside a git repo or no staged files — skip silently.
    return [];
  }
}

function isBinary(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return BINARY_EXT.has(ext);
}

const stagedFiles = getStagedFiles();
const violations = [];

// 1. Check for forbidden file names.
for (const file of stagedFiles) {
  const basename = file.split('/').pop() ?? file;
  if (FORBIDDEN_FILES.some((re) => re.test(basename))) {
    violations.push({ file, line: null, kind: 'Forbidden file type', match: file });
  }
}

// 2. Scan file contents for secret patterns.
for (const file of stagedFiles) {
  if (isBinary(file)) continue;

  let content;
  try {
    // Read the staged version (index), not the working tree.
    content = execSync(`git show :${file}`, { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
  } catch {
    continue;
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('# nosec')) continue;
    for (const { name, regex } of PATTERNS) {
      if (regex.test(line)) {
        const preview = line.trim().slice(0, 120);
        violations.push({ file, line: i + 1, kind: name, match: preview });
        break; // one violation per line is enough
      }
    }
  }
}

if (violations.length === 0) {
  console.log('✓ No secrets detected in staged files.');
  process.exit(0);
}

console.error('✗ Potential secrets detected in staged files:\n');
for (const { file, line, kind, match } of violations) {
  const loc = line ? `${file}:${line}` : file;
  console.error(`  [${kind}] ${loc}`);
  console.error(`    ${match}\n`);
}
console.error(
  'Remove the sensitive data, then re-stage.\n' +
  'If this is a false positive, prepend the line with: # nosec\n' +
  '(the scanner skips lines containing that marker)',
);
process.exit(1);
