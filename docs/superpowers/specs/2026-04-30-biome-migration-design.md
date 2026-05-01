# Biome Migration Design

## Goal

Replace ESLint + Prettier with Biome (linter + formatter) and rustywind (Tailwind CSS class sorting), achieving a faster, simpler toolchain with a single Rust-based binary for linting and formatting.

## Context

The current toolchain consists of:

- **ESLint 9** (flat config) with `eslint-config-next`, `eslint-config-prettier`, `eslint-plugin-prettier`
- **Prettier 3** with `prettier-plugin-tailwindcss`
- **lint-staged** + **Husky** pre-commit hook
- **Claude Code PostToolUse hooks** running `eslint --fix` and `prettier --write` after each file edit

## Approach

Full replacement (no gradual migration). Remove all ESLint and Prettier tooling in one branch. Biome handles linting and formatting. rustywind handles Tailwind CSS class sorting. The Next.js-specific rules from `eslint-config-next` (`@next/next/*`) are intentionally dropped — the codebase already follows these patterns and they will be enforced via code review.

## What Changes

### Packages removed

- `eslint`
- `eslint-config-next`
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- `prettier`
- `prettier-plugin-tailwindcss`
- `lint-staged`

### Packages added

- `@biomejs/biome` (devDependency) — linter + formatter
- `rustywind` (devDependency) — Tailwind CSS class sorting

### Files removed

- `eslint.config.mjs`
- `.prettierrc.json`
- `.prettierignore`

### Files created

- `biome.json` — Biome configuration (see below)

### Files modified

- `package.json` — scripts and devDependencies
- `.husky/pre-commit` — replaces lint-staged with direct Biome + rustywind invocation
- `.claude/settings.json` — PostToolUse hooks updated

## Biome Configuration (`biome.json`)

Formatter settings are equivalent to the current `.prettierrc.json`:

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
      "a11y": { "all": true }
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

## Scripts Mapping

| Script          | Current command                                       | New command              |
| --------------- | ----------------------------------------------------- | ------------------------ |
| `lint`          | `eslint`                                              | `biome lint .`           |
| `lint:fix`      | `eslint --fix`                                        | `biome lint --write .`   |
| `format`        | `prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"` | `biome format --write .` |
| `format:check`  | `prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"` | `biome format .`         |
| `check` _(new)_ | —                                                     | `biome check --write .`  |

The `check` script runs lint + format together — useful as the primary "fix everything" command.

## Pre-commit Hook

Replace lint-staged with direct invocation in `.husky/pre-commit`:

```bash
npx @biomejs/biome check --write --no-errors-on-unmatched-files .
rustywind --write $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jsx|tsx)$')
```

lint-staged is no longer needed and is removed entirely.

## Claude Code PostToolUse Hooks

Replace the two current hooks (eslint + prettier) with:

```json
{
  "type": "command",
  "command": "FILE=...; npx @biomejs/biome check --write \"$FILE\" 2>/dev/null || true"
},
{
  "type": "command",
  "command": "FILE=...; case \"$FILE\" in *.tsx|*.jsx) rustywind --write \"$FILE\" 2>/dev/null || true;; esac"
}
```

## Commit Strategy

Three commits on branch `enhancement/biome-migration`:

1. **`chore: replace eslint and prettier with biome and rustywind`**
   — install/uninstall packages, create `biome.json`, update scripts, update Husky hook, update Claude Code hooks, remove old config files

2. **`chore: apply initial biome format and rustywind pass`**
   — run `biome format --write .` and `rustywind --write` on all `.tsx`/`.jsx` files
   — normalisation-only commit (whitespace and style, no logic changes)

3. **`chore: update docs and copilot instructions for biome toolchain`**
   — update `CLAUDE.md`, `.github/copilot-instructions.md`, and `README.md` to reflect the new toolchain

## Trade-offs

| What we gain                              | What we drop                                            |
| ----------------------------------------- | ------------------------------------------------------- |
| Single fast Rust binary for lint + format | `@next/next/*` rules (enforced via code review instead) |
| No ESLint/Prettier config coordination    | —                                                       |
| Faster pre-commit and CI                  | —                                                       |
| Simpler Claude Code hooks                 | —                                                       |

## Out of Scope

- CI pipeline changes (GitHub Actions already runs `npm run lint && npm run format:check` — scripts are updated to use Biome, so CI works without changes)
- Biome version pinning strategy (use latest stable at migration time)
