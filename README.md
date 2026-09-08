# `@dappermountain/agent-practices`

Reusable **Cursor / coding-agent rules** (`.mdc`) for Bun, Devmoji commits, clean code, TypeScript, and agent workflow. Optional **`monorepo.mdc`** is copied only for monorepo consumers.

Payload-agnostic. For Payload CMS rules and skill vendoring, use [`@dappermountain/agent-payload`](https://www.npmjs.com/package/@dappermountain/agent-payload).

## Install

```bash
bun add -d @dappermountain/agent-practices
```

Installing the package does **not** activate rules in Cursor. Run sync so files land under `.agents/`:

```bash
bunx @dappermountain/agent-practices sync
# or after install:
bun run agents:sync
```

Recommended `package.json` script:

```json
{
  "scripts": {
    "agents:sync": "agent-practices sync"
  }
}
```

When also using `@dappermountain/agent-payload`, prefer that package’s `agents:sync` (it runs practices sync first, then Payload rules/overlay).

## What sync does

1. Copies always-on rules into `.agents/rules/`:
   - `bun.mdc`, `commits.mdc`, `clean.mdc`, `typescript.mdc`, `agent-workflow.mdc`
2. Copies `monorepo.mdc` **only if** the consumer looks like a monorepo, or `--monorepo` is passed:
   - `package.json` has `"workspaces"`, **or**
   - `turbo.json` exists, **or**
   - `pnpm-workspace.yaml` exists, **or**
   - CLI flag `--monorepo`
3. Removes a stale `monorepo.mdc` when syncing a single-package repo (`--no-monorepo` forces skip).
4. Ensures Cursor discovery symlinks (idempotent):

```text
.cursor/rules  -> ../.agents/rules
.cursor/skills -> ../.agents/skills
```

Canonical content lives under **`.agents/`**. Do not duplicate rule files under `.cursor/`.

## Rules vs skills

| | **Rules (`.mdc`)** | **Skills (`SKILL.md`)** |
| --- | --- | --- |
| This package | Standing constraints (`alwaysApply` / globs) | — |
| Cursor discovery | `.cursor/rules` → `.agents/rules` | `.cursor/skills` → `.agents/skills` |
| `skills` CLI | Not applicable | Installs skill folders only |

Installing from the registry does not register Cursor rules by itself — consumers must run sync.

## CLI

```text
agent-practices sync [cwd] [--monorepo] [--no-monorepo]
```

## License

MIT
