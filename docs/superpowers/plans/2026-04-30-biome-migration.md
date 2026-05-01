# Biome Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ESLint + Prettier + lint-staged with Biome (linter + formatter) and rustywind (Tailwind CSS class sorting).

**Architecture:** Full replacement in one branch. Three commits: (1) config + toolchain swap, (2) initial format normalization pass, (3) docs update + spec/plan cleanup.

**Tech Stack:** `@biomejs/biome`, `rustywind`, Husky, Next.js 16, TypeScript strict, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-04-30-biome-migration-design.md`

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `biome.json` | Create | Biome config (lint + format rules) |
| `eslint.config.mjs` | Delete | Replaced by Biome |
| `.prettierrc.json` | Delete | Replaced by Biome formatter |
| `.prettierignore` | Delete | Replaced by `files.ignore` in biome.json |
| `package.json` | Modify | Scripts + devDependencies |
| `.husky/pre-commit` | Modify | Replace lint-staged with Biome + rustywind |
| `.claude/settings.json` | Modify | PostToolUse hooks |
| `CLAUDE.md` | Modify | Update toolchain references |
| `.github/copilot-instructions.md` | Modify | Update toolchain references |
| `docs/superpowers/specs/2026-04-30-biome-migration-design.md` | Delete | Cleanup after implementation |
| `docs/superpowers/plans/2026-04-30-biome-migration.md` | Delete | Cleanup after implementation (this file) |

---

### Task 1: Create branch

- [ ] **Step 1: Verify master is up to date**

```bash
git checkout master && git pull
```

Expected: already up to date or fast-forward.

- [ ] **Step 2: Create branch**

```bash
git checkout -b enhancement/biome-migration
```

---

### Task 2: Uninstall ESLint, Prettier, lint-staged

**Files:**
- Modify: `package.json` (devDependencies + lint-staged section)

- [ ] **Step 1: Uninstall packages**

```bash
npm uninstall eslint eslint-config-next eslint-config-prettier eslint-plugin-prettier prettier prettier-plugin-tailwindcss lint-staged
```

Expected: `package.json` and `package-lock.json` updated, no errors.

- [ ] **Step 2: Verify they're gone**

```bash
cat package.json | grep -E "eslint|prettier|lint-staged"
```

Expected: no matches (except possibly in scripts — those get updated in Task 4).

---

### Task 3: Install Biome and rustywind

**Files:**
- Modify: `package.json` (devDependencies)

- [ ] **Step 1: Install packages**

```bash
npm install --save-dev @biomejs/biome rustywind
```

Expected: both appear in `devDependencies` in `package.json`.

- [ ] **Step 2: Verify binaries work**

```bash
npx @biomejs/biome --version
npx rustywind --version
```

Expected: version numbers printed, no errors.

---

### Task 4: Create `biome.json`

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Create the file**

Create `/Users/tom.pais/WebstormProjects/wedding-invitation-ui/biome.json` with this exact content:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "formatter": {
    "enabled": true,
    "lineWidth": 80,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "trailingCommas": "es5",
      "quoteStyle": "double",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "jsxQuoteStyle": "double"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "all": true
      }
    }
  },
  "files": {
    "ignore": [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "prisma/migrations/**",
      "src/types/supabase.ts",
      "next-env.d.ts"
    ]
  }
}
```

- [ ] **Step 2: Run a dry-run check to surface any lint errors**

```bash
npx @biomejs/biome check .
```

Expected: output listing any lint issues. **Do not fix yet** — note what surfaces. If `a11y: { all: true }` produces many errors on existing code, change it to `a11y: { "recommended": true }` in `biome.json` and re-run. The goal is zero errors before committing.

- [ ] **Step 3: Auto-fix any fixable issues**

```bash
npx @biomejs/biome check --write .
```

Expected: errors reduced. If unfixable errors remain, disable the specific rule inline or in `biome.json` under `"overrides"`. Do not suppress wholesale — fix or override explicitly.

---

### Task 5: Update `package.json` scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update scripts section**

Replace the current `scripts` block entries for lint and format:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "biome lint .",
  "lint:fix": "biome lint --write .",
  "format": "biome format --write .",
  "format:check": "biome format .",
  "check": "biome check --write .",
  "types": "supabase gen types typescript --project-id yckzrkriuqhlumuaydsb > src/types/supabase.ts"
}
```

Also remove the `"lint-staged"` top-level key entirely from `package.json` (it was used by lint-staged, now obsolete):

```json
// Remove this entire block:
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

- [ ] **Step 2: Verify scripts work**

```bash
npm run lint
npm run format:check
```

Expected: both exit 0, output from Biome (not ESLint/Prettier).

---

### Task 6: Update `.husky/pre-commit`

**Files:**
- Modify: `.husky/pre-commit`

- [ ] **Step 1: Replace file content**

Replace the entire content of `.husky/pre-commit` with:

```bash
npx @biomejs/biome check --write --no-errors-on-unmatched-files .
STAGED_TSX=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jsx|tsx)$' || true)
if [ -n "$STAGED_TSX" ]; then
  rustywind --write $STAGED_TSX
fi
```

- [ ] **Step 2: Make sure it's executable**

```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 3: Test the hook manually**

```bash
bash .husky/pre-commit
```

Expected: exits 0, Biome output visible.

---

### Task 7: Update `.claude/settings.json` PostToolUse hooks

**Files:**
- Modify: `.claude/settings.json`

- [ ] **Step 1: Replace the PostToolUse hooks**

The current `PostToolUse` array has two hooks (ESLint + Prettier). Replace it with:

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [
      {
        "type": "command",
        "command": "FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import json,sys; d=json.load(sys.stdin); print(d.get('file_path',''))\"); if [ -n \"$FILE\" ]; then npx @biomejs/biome check --write \"$FILE\" 2>/dev/null || true; fi"
      },
      {
        "type": "command",
        "command": "FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import json,sys; d=json.load(sys.stdin); print(d.get('file_path',''))\"); case \"$FILE\" in *.tsx|*.jsx) rustywind --write \"$FILE\" 2>/dev/null || true;; esac"
      }
    ]
  }
]
```

- [ ] **Step 2: Verify JSON is valid**

```bash
cat .claude/settings.json | python3 -m json.tool > /dev/null && echo "valid JSON"
```

Expected: `valid JSON`.

---

### Task 8: Delete old config files

**Files:**
- Delete: `eslint.config.mjs`
- Delete: `.prettierrc.json`
- Delete: `.prettierignore`

- [ ] **Step 1: Delete the files**

```bash
rm eslint.config.mjs .prettierrc.json .prettierignore
```

- [ ] **Step 2: Confirm they're gone**

```bash
ls eslint.config.mjs .prettierrc.json .prettierignore 2>&1
```

Expected: "No such file or directory" for all three.

---

### Task 9: Commit 1 — toolchain swap

- [ ] **Step 1: Verify build still passes**

```bash
npm run build
```

Expected: successful build, no errors.

- [ ] **Step 2: Run lint and format check**

```bash
npm run lint && npm run format:check
```

Expected: both exit 0.

- [ ] **Step 3: Stage and commit**

```bash
git add biome.json package.json package-lock.json .husky/pre-commit .claude/settings.json
git add -u eslint.config.mjs .prettierrc.json .prettierignore
git commit -m "chore: replace eslint and prettier with biome and rustywind"
```

Expected: commit created on `enhancement/biome-migration`.

---

### Task 10: Commit 2 — initial format normalization pass

This commit will be large (whitespace/style diffs across many files). That's expected and intentional.

- [ ] **Step 1: Run Biome format on all files**

```bash
npx @biomejs/biome format --write .
```

- [ ] **Step 2: Run rustywind on all TSX/JSX files**

```bash
find src -name "*.tsx" -o -name "*.jsx" | xargs rustywind --write
```

- [ ] **Step 3: Verify no logic changes — build must still pass**

```bash
npm run build
```

Expected: successful build. If it fails, a logic change slipped in — investigate before committing.

- [ ] **Step 4: Commit the normalization pass**

```bash
git add -A
git commit -m "chore: apply initial biome format and rustywind pass"
```

---

### Task 11: Update docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.github/copilot-instructions.md`

- [ ] **Step 1: Update `CLAUDE.md`**

Find and update these references:
- Under `## Development Commands`: replace `npm run lint` / `npm run format` descriptions to mention Biome
- Under Zero-Warning Policy (if present): replace ESLint/Prettier references with Biome
- Under `## Important Notes`: remove any ESLint/Prettier-specific notes; add note that `src/types/supabase.ts` is ignored in `biome.json`

- [ ] **Step 2: Update `.github/copilot-instructions.md`**

Find any references to ESLint or Prettier and replace with Biome equivalents. Keep the same structure.

- [ ] **Step 3: Verify no lint issues in updated docs**

```bash
npm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md .github/copilot-instructions.md
git commit -m "chore: update docs for biome toolchain"
```

---

### Task 12: Cleanup — delete spec and plan files

- [ ] **Step 1: Delete spec and plan**

```bash
rm docs/superpowers/specs/2026-04-30-biome-migration-design.md
rm docs/superpowers/plans/2026-04-30-biome-migration.md
```

- [ ] **Step 2: Commit**

```bash
git add -u docs/superpowers/specs/2026-04-30-biome-migration-design.md
git add -u docs/superpowers/plans/2026-04-30-biome-migration.md
git commit -m "chore: remove biome migration spec and plan"
```

---

### Task 13: Open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin enhancement/biome-migration
```

- [ ] **Step 2: Open PR**

```bash
gh pr create \
  --title "[ENH] Migrate from ESLint + Prettier to Biome + rustywind" \
  --body "$(cat <<'EOF'
## Summary

- Replaces ESLint + Prettier + lint-staged with Biome (linter + formatter) and rustywind (Tailwind CSS class sorting)
- Single Rust-based binary for lint and format — faster pre-commit and CI
- `@next/next/*` rules intentionally dropped — enforced via code review
- Three commits: toolchain swap → format normalization → docs update

## Test plan

- [ ] `npm run lint` exits 0
- [ ] `npm run format:check` exits 0
- [ ] `npm run build` passes
- [ ] Pre-commit hook runs Biome + rustywind on staged files
- [ ] Claude Code PostToolUse hooks run Biome after file edits

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
