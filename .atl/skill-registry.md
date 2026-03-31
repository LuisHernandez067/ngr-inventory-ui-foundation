# Skill Registry — ngr-inventory-ui-foundation

Generated: 2026-03-31
Mode: engram

---

## User-Level Skills

Scanned from: `~/.config/opencode/skills/`

| Skill           | Path                                               | Trigger                                                                                                          |
| --------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `go-testing`    | `~/.config/opencode/skills/go-testing/SKILL.md`    | When writing Go tests, using teatest, or adding test coverage                                                    |
| `sdd-apply`     | `~/.config/opencode/skills/sdd-apply/SKILL.md`     | When the orchestrator launches you to implement one or more tasks from a change                                  |
| `sdd-archive`   | `~/.config/opencode/skills/sdd-archive/SKILL.md`   | When the orchestrator launches you to archive a change after implementation and verification                     |
| `sdd-design`    | `~/.config/opencode/skills/sdd-design/SKILL.md`    | When the orchestrator launches you to write or update the technical design for a change                          |
| `sdd-explore`   | `~/.config/opencode/skills/sdd-explore/SKILL.md`   | When the orchestrator launches you to think through a feature, investigate the codebase, or clarify requirements |
| `sdd-init`      | `~/.config/opencode/skills/sdd-init/SKILL.md`      | When user wants to initialize SDD in a project                                                                   |
| `sdd-propose`   | `~/.config/opencode/skills/sdd-propose/SKILL.md`   | When the orchestrator launches you to create or update a proposal for a change                                   |
| `sdd-spec`      | `~/.config/opencode/skills/sdd-spec/SKILL.md`      | When the orchestrator launches you to write or update specs for a change                                         |
| `sdd-tasks`     | `~/.config/opencode/skills/sdd-tasks/SKILL.md`     | When the orchestrator launches you to create or update the task breakdown for a change                           |
| `sdd-verify`    | `~/.config/opencode/skills/sdd-verify/SKILL.md`    | When the orchestrator launches you to verify a completed (or partially completed) change                         |
| `skill-creator` | `~/.config/opencode/skills/skill-creator/SKILL.md` | When user asks to create a new skill, add agent instructions, or document patterns for AI                        |

---

## Project-Level Skills

Scanned from: `.claude/skills/`, `.gemini/skills/`, `.agent/skills/`, `skills/`

_No project-level skills found._

---

## Project Convention Files

Scanned from project root: `AGENTS.md`, `agents.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`

_No convention files found in project root._

---

## Notes

- SDD phases (`sdd-*`) are available as user-level skills.
- No project-level skill overrides detected.
- Project uses **engram** persistence mode — no `openspec/` directory.
- Skill resolution for sub-agent prompts: use exact paths from the table above.
