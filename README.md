# `@dappermountain/agent-practices`

Reusable **Cursor / coding-agent rules** (`.mdc`) for Bun, Devmoji commits, clean code, TypeScript, and agent workflow. Optional **`monorepo.mdc`** is copied only for monorepo consumers.

This package is **Payload-agnostic**. For Payload CMS rules and skill vendoring, use [`@dappermountain/agent-payload`](https://github.com/DapperMountain/agent-payload).

## Rules vs skills

| | **Rules (`.mdc`)** | **Skills (`SKILL.md`)** |
| --- | --- | --- |
| What this package ships | Standing constraints (`alwaysApply` / globs) | — (none) |
| How Cursor loads them | Via `.cursor/rules` → `.agents/rules` | Via `.cursor/skills` → `.agents/skills` |
| npm / `skills` CLI | **Not** skill packages | Installs skill folders only |

Installing the package into `node_modules` does **not** activate rules. You must run **`agents:sync`** (or this package’s `sync` CLI) so files land under `.agents/`.

## Install (GitHub first)

```bash
bun add -d github:DapperMountain/agent-practices
```

Then sync into the consumer repo:

```bash
bunx @dappermountain/agent-practices sync
# or from a script:
bun run agents:sync
```

Recommended consumer `package.json` script:

```json
{
  "scripts": {
    "agents:sync": "bunx @dappermountain/agent-practices sync"
  }
}
```

When also using `@dappermountain/agent-payload`, run **practices sync then payload sync** (or use payload’s composed `agents:sync`).

## What sync does

1. Copies always-on rules into `.agents/rules/`:
   - `bun.mdc`, `commits.mdc`, `clean.mdc`, `typescript.mdc`, `agent-workflow.mdc`
2. Copies `monorepo.mdc` **only if** the consumer looks like a monorepo, or you pass `--monorepo`:
   - `package.json` has `"workspaces"`, **or**
   - `turbo.json` exists, **or**
   - `pnpm-workspace.yaml` exists, **or**
   - CLI flag `--monorepo`
3. Removes a stale `monorepo.mdc` when syncing a single-package repo (use `--no-monorepo` to force skip).
4. Ensures Cursor discovery symlinks (idempotent):

```bash
.cursor/rules  -> ../.agents/rules
.cursor/skills -> ../.agents/skills
```

Canonical content lives under **`.agents/`**. Do not duplicate rule files under `.cursor/`.

## Prefer sync over postinstall

Bun blocks untrusted lifecycle scripts for GitHub dependencies. Consumers should run `agents:sync` explicitly after install / upgrade.

## npm later

Same pattern as other `@dappermountain/*` packages: publish to npm; `files` includes `rules/` and `bin/`. Publishing alone does not register Cursor rules — sync still required.

## License

MIT
