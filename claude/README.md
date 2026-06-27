# claude/

Operational docs for WedPlan. The project is **built and live** — this folder is now tuned
for the **maintenance phase** (small bug fixes + small feature changes), not the original
multi-agent build.

## Active docs
| File | Purpose |
|---|---|
| [skills.md](skills.md) | The maintenance skills you can run + the engineering standards they enforce |
| [rules.md](rules.md) | Git, code, UI, security, and QA rules (current branch model) |
| [github.md](github.md) | Branch strategy, PR template, GitHub Actions |
| [todo.md](todo.md) | Live backlog / known issues |

## Invokable skills
Real, runnable skills live in `.claude/skills/`:
- `/fix-bug` — structured bug-fix workflow
- `/add-small-feature` — small feature / feature-change workflow
- `/ship-check` — build + lint + typecheck + smoke quality gate

## archive/
The original heavy build-phase system (12 agents, 12 worktree lanes, Phase-0 audit) is kept
in [archive/](archive/) for history. It is **not** the current process — don't follow its
`dev`-branch / per-lane worktree instructions for maintenance work.
