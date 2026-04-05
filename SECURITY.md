# Security Rules

Paranoid-level security baseline for this Vite + React + TypeScript + pnpm project.
All rules are **mandatory** unless explicitly noted otherwise.

---

## 1. Dependency Versioning

### No floating ranges in `package.json`
- **Forbidden:** `^`, `~`, `*`, `>=`, `>`, `x`
- **Required:** exact versions only — `"react": "19.2.4"`, not `"react": "^19.2.4"`
- **Why:** floating ranges silently pull in new minor/patch releases on every fresh install. A compromised patch release (e.g. `event-stream@3.3.6`) will be installed automatically.
- **Exception:** `devDependencies` that are never bundled into the production build may use `~` (patch-only range) if pinning causes CI friction — but document it explicitly.

```jsonc
// BAD
"react": "^19.2.4"
"vite": "~8.0.1"

// GOOD
"react": "19.2.4"
"vite": "8.0.3"
```

### Lockfile is canonical
- `pnpm-lock.yaml` must always be committed and kept up-to-date.
- Never run `pnpm install --no-lockfile` or delete the lockfile to "fix" install issues.
- CI must run `pnpm install --frozen-lockfile` — fail the build if the lockfile is out of sync.

### Audit on every dependency change
- Run `pnpm audit` after every `pnpm add` / `pnpm update`. A build with known high/critical CVEs must not be merged.
- Automate: add a `pnpm audit --audit-level=high` step to CI.

### Vet new packages before adding
Before `pnpm add <package>`:
1. Check npm download trend — abandoned packages are a risk.
2. Check the GitHub repo for recent activity and open security issues.
3. Prefer packages with <10 transitive dependencies.
4. Avoid packages that require `postinstall` scripts unless the source is audited.

---

## 2. Supply Chain

### No arbitrary postinstall scripts
- Review every `package.json` of new dependencies for `postinstall`, `preinstall`, `install` scripts before adding.
- In `package.json` (root), add:
```json
"pnpm": {
  "onlyBuiltDependencies": []
}
```
List only the packages that legitimately need to build native binaries (e.g. `lightningcss`, `@tailwindcss/oxide`). All others must be blocked.

### Integrity verification
- `pnpm-lock.yaml` includes content hashes — never manually edit this file.
- In CI, `--frozen-lockfile` ensures installed versions match hashes in the lockfile exactly.

---

## 3. Secrets & Environment Variables

### Never commit secrets
- `.env`, `.env.local`, `.env.*.local` must be in `.gitignore`.
- Never hardcode API keys, tokens, or passwords anywhere in source code.
- Use `import.meta.env.VITE_*` for client-side config — remember: **everything with `VITE_` prefix is visible in the browser bundle**.

### No server secrets in the frontend bundle
- Secrets that must remain private (auth tokens, signing keys) must **never** be prefixed with `VITE_`.
- Vite strips non-`VITE_` env vars from the client bundle — verify this with `vite build --mode production` and inspect the output.

### Audit env usage before every release
- `grep -r "process.env\|import.meta.env" src/` — review every hit.
- Confirm no sensitive key names appear in the built `dist/` output.

---

## 4. XSS Prevention

### Never use `dangerouslySetInnerHTML`
- Forbidden in all components unless the input is sanitized by a dedicated library (e.g. DOMPurify) and the PR is reviewed for XSS.
- Prefer rendering data as text nodes — React escapes by default.

### No `eval`, `new Function`, `setTimeout(string)`
- Dynamic code execution with user-controlled strings is never acceptable.

### Sanitize all user input rendered as HTML
- If rich text is ever needed, use DOMPurify with a strict allowlist.

---

## 5. localStorage Security

This project persists `PlayerState` to `localStorage` under `dnd-roguelike-save`.

- **Never store authentication tokens, session IDs, or PII in `localStorage`.**
- Always validate data read from `localStorage` before use — it can be tampered with by the user or injected by XSS.
- Use a schema validator (e.g. Zod) for any data loaded from `localStorage` into Zustand state.
- Treat `localStorage` data as untrusted user input, not as internal application state.

---

## 6. Build Hardening

### Source maps in production
- Do **not** ship source maps to production (`build.sourcemap: false` in `vite.config.ts`).
- Source maps expose original TypeScript source to anyone who opens DevTools.
- Keep source maps only for error monitoring services (upload to Sentry/etc. and delete from the public bundle).

### Content Security Policy
If this project is ever deployed behind a real server, add a strict CSP header:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```
Avoid `unsafe-eval` — it bypasses the main XSS protection of CSP.

### Subresource Integrity (SRI)
- Never load scripts or stylesheets from external CDNs without `integrity` and `crossorigin` attributes.
- Prefer bundling all assets locally (Vite does this by default).

---

## 7. TypeScript Strictness

`tsconfig.json` must have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```
Weak typing enables logic bugs that become security bugs (e.g. unchecked array access from untrusted data).

---

## 8. Code Review Checklist

Every PR touching security-relevant code must be reviewed against:

- [ ] No new `^`/`~` version ranges added to `package.json`
- [ ] `pnpm audit` passes with no high/critical issues
- [ ] No secrets, tokens, or PII added to source or env files
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] No `eval` / `new Function` / dynamic code execution
- [ ] `localStorage` reads are validated before use
- [ ] No source maps configured for production build
- [ ] No external CDN scripts without SRI

---

## 9. CI Enforcement

The following must run on every PR and block merge on failure:

```yaml
- pnpm install --frozen-lockfile   # lockfile integrity
- pnpm audit --audit-level=high    # known CVEs
- pnpm run lint                    # ESLint rules catch unsafe patterns
- pnpm run build                   # no TypeScript errors
- pnpm run test                    # no regressions
- pnpm run test:ct                 # no component regressions
```

---

## 10. Incident Response

If a compromised dependency or data leak is discovered:
1. Remove or pin the affected package immediately.
2. Rotate any secrets that may have been exposed.
3. Audit `git log` for the window of exposure.
4. Document in a post-mortem what rule was violated and update this file.
