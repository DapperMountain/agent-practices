#!/usr/bin/env bun
/**
 * Copy practice rules into the consumer's .agents/rules/ and ensure
 * .cursor/rules + .cursor/skills symlinks point at .agents/.
 *
 * Usage:
 *   bunx @dappermountain/agent-practices sync [cwd]
 *   bun ./bin/sync.ts [--monorepo] [--no-monorepo] [cwd]
 */

import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ALWAYS_RULES = [
  'bun.mdc',
  'commits.mdc',
  'clean.mdc',
  'typescript.mdc',
  'agent-workflow.mdc',
] as const

const MONOREPO_RULE = 'monorepo.mdc'

function packageRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..')
}

function parseArgs(argv: string[]): { cwd: string; forceMonorepo: boolean | null } {
  let forceMonorepo: boolean | null = null
  const positional: string[] = []
  for (const arg of argv) {
    if (arg === 'sync') continue
    if (arg === '--monorepo') {
      forceMonorepo = true
      continue
    }
    if (arg === '--no-monorepo') {
      forceMonorepo = false
      continue
    }
    if (arg.startsWith('-')) {
      console.error(`Unknown flag: ${arg}`)
      process.exit(1)
    }
    positional.push(arg)
  }
  return { cwd: resolve(positional[0] ?? process.cwd()), forceMonorepo }
}

function detectMonorepo(cwd: string): boolean {
  if (existsSync(join(cwd, 'turbo.json'))) return true
  if (existsSync(join(cwd, 'pnpm-workspace.yaml'))) return true
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath)) return false
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { workspaces?: unknown }
    return Boolean(pkg.workspaces)
  } catch {
    return false
  }
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true })
}

function ensureSymlink(linkPath: string, target: string): void {
  ensureDir(dirname(linkPath))
  if (existsSync(linkPath)) {
    try {
      const stat = lstatSync(linkPath)
      if (stat.isSymbolicLink()) {
        unlinkSync(linkPath)
      } else {
        console.warn(`skip symlink ${linkPath}: path exists and is not a symlink`)
        return
      }
    } catch {
      // continue
    }
  }
  symlinkSync(target, linkPath)
  console.log(`symlink ${linkPath} -> ${target}`)
}

function copyRule(src: string, dest: string): void {
  copyFileSync(src, dest)
  console.log(`copied ${dest}`)
}

function main(): void {
  const { cwd, forceMonorepo } = parseArgs(process.argv.slice(2))
  const root = packageRoot()
  const rulesSrc = join(root, 'rules')
  const rulesDest = join(cwd, '.agents', 'rules')

  ensureDir(rulesDest)

  for (const name of ALWAYS_RULES) {
    copyRule(join(rulesSrc, name), join(rulesDest, name))
  }

  const wantMonorepo = forceMonorepo ?? detectMonorepo(cwd)
  const monorepoDest = join(rulesDest, MONOREPO_RULE)
  if (wantMonorepo) {
    copyRule(join(rulesSrc, MONOREPO_RULE), monorepoDest)
  } else if (existsSync(monorepoDest)) {
    unlinkSync(monorepoDest)
    console.log(`removed stale ${monorepoDest}`)
  } else {
    console.log(`skip ${MONOREPO_RULE} (single-package repo)`)
  }

  ensureSymlink(join(cwd, '.cursor', 'rules'), '../.agents/rules')
  ensureSymlink(join(cwd, '.cursor', 'skills'), '../.agents/skills')
  ensureDir(join(cwd, '.agents', 'skills'))

  console.log(`agent-practices sync complete → ${rulesDest}`)
}

main()
