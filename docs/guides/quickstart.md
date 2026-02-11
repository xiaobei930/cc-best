# Quick Start Guide

> Get productive with CC-Best in 5 minutes.

## 1. Install (30 seconds)

```bash
# Add marketplace and install
/plugin marketplace add xiaobei930/cc-best
/plugin install cc-best@xiaobei930

# Verify installation
/cc-best:status
```

You should see a summary of all installed components (38 commands, 17 skills, 8 agents, 33 rules).

## 2. Your First Iterate (2 minutes)

```bash
/cc-best:iterate "add a login page with email and password"
```

### What Happens Next?

Claude automatically runs a full development pipeline:

```
1. 📋 /cc-best:pm       → Analyzes requirements, creates REQ-001
2. 🔍 /cc-best:clarify  → Clarifies any ambiguous points (if needed)
3. 🏗️ /cc-best:lead     → Designs technical solution, creates DES-001 + TSK-001
4. 🎨 /cc-best:designer → Generates UI guidance (frontend tasks only)
5. 💻 /cc-best:dev      → Writes code, runs self-tests
6. ✅ /cc-best:verify   → Build + type-check + lint + test + security scan
7. 🧪 /cc-best:qa       → Functional acceptance testing
8. 📦 /cc-best:commit   → Creates conventional commit
```

**You just watch.** Intervene only when needed (Ctrl+C to pause).

### How Iterate Selects Roles

The iterate engine reads `memory-bank/progress.md` and selects the appropriate role:

| Current State                | Role Selected       | Action                     |
| ---------------------------- | ------------------- | -------------------------- |
| No requirements doc          | `/cc-best:pm`       | Requirement analysis       |
| REQ has low-confidence items | `/cc-best:clarify`  | Requirement clarification  |
| Has REQ, no design           | `/cc-best:lead`     | Technical design           |
| Has design, frontend tasks   | `/cc-best:designer` | UI design guidance         |
| Has tasks to implement       | `/cc-best:dev`      | Coding implementation      |
| Code ready for verification  | `/cc-best:verify`   | Comprehensive verification |
| Verification passed          | `/cc-best:qa`       | Functional acceptance      |

### When to Intervene

- **Ctrl+C**: Pause immediately. Progress is saved to `memory-bank/progress.md`.
- **Type anything**: Claude pauses and waits for your input.
- **Resume**: Continue the conversation — Claude picks up where it left off.

### Stop Conditions

Iterate stops **only** when:

1. All tasks are completed
2. You interrupt (Ctrl+C or Escape)
3. A fatal error occurs that cannot be auto-resolved
4. An external dependency requires your decision

## 3. Understanding the Role Pipeline

Each role has clear boundaries:

```
PM (what to build)
 └→ Lead (how to build)
     └→ Designer (how it looks — frontend only)
         └→ Dev (build it)
             └→ QA (verify it works)
                 └→ Verify + Commit (ship it)
```

### Role Boundaries

Every role follows **MUST/SHOULD/NEVER** rules:

| Role | MUST                               | NEVER                            |
| ---- | ---------------------------------- | -------------------------------- |
| PM   | Analyze requirements autonomously  | Guess APIs, skip context reading |
| Lead | Review PM decisions, create design | Start coding, skip decomposition |
| Dev  | Follow tech design, self-test      | Modify unassigned modules        |
| QA   | Test all acceptance criteria       | Modify source code               |

### Document Traceability

Roles create numbered documents that link together:

```
REQ-001 (PM creates)
 └→ DES-001 (Lead creates, references REQ-001)
     └→ TSK-001, TSK-002 (Lead creates, reference DES-001)
```

### Downstream Correction (A3)

- **Lead reviews PM**: Can adjust requirement priority or scope
- **QA distinguishes bugs**: Implementation bugs → back to Dev; Requirement assumption errors → flagged for PM review

## 4. Try Pair Programming

When you want step-by-step collaboration instead of full autonomy:

```bash
/cc-best:pair "help me refactor this authentication module"
```

### iterate vs pair

| Aspect   | `/cc-best:iterate`      | `/cc-best:pair`                |
| -------- | ----------------------- | ------------------------------ |
| Control  | Fully autonomous        | Confirm each step              |
| Best for | Clear tasks, batch work | Learning, sensitive operations |
| Risk     | Medium (post-check)     | Low (pre-confirm)              |

### 5 Confirmation Checkpoints

In pair mode, Claude **always** asks before:

1. **Understanding** — "I understand you need X. Correct?"
2. **Design choice** — "Option A or B? I recommend A because..."
3. **Destructive action** — "About to delete X. Confirm?"
4. **External call** — "Will call production API. Proceed?"
5. **Commit** — "Commit message: '...'. OK?"

### Learning Mode

```bash
/cc-best:pair --learn "teach me how to write unit tests"
```

Claude adjusts its behavior:

- Explains **why** before each step
- Shows intermediate results
- Explains errors and debugging process
- Encourages you to ask questions

## 5. Top 10 Commands

| Command               | What It Does                              |
| --------------------- | ----------------------------------------- |
| `/cc-best:iterate`    | Autonomous full-pipeline development      |
| `/cc-best:pair`       | Step-by-step collaborative development    |
| `/cc-best:pm`         | Analyze requirements, create REQ document |
| `/cc-best:lead`       | Design technical solution, create DES/TSK |
| `/cc-best:dev`        | Write code following the tech design      |
| `/cc-best:qa`         | Test and validate implementation          |
| `/cc-best:commit`     | Create conventional commit                |
| `/cc-best:status`     | Check plugin installation status          |
| `/cc-best:checkpoint` | Save current context for later recovery   |
| `/cc-best:catchup`    | Restore context from previous session     |

## 6. Setting Up Your Project

### Minimal CLAUDE.md Template

Your `CLAUDE.md` should define project-specific constraints. Keep it under 100 lines:

```markdown
# Project Name

## Core Constraints

- **Language**: TypeScript + React
- **Testing**: Vitest, coverage > 80%
- **API**: REST, OpenAPI spec in docs/api/

## Current State

See `memory-bank/progress.md`

## Forbidden

- No `any` types
- No committing .env files
```

### Initialize Memory Bank

```bash
# Plugin users: automatic on first session
# Clone users: run init script
bash scripts/shell/init.sh
```

This creates:

- `memory-bank/progress.md` — Rolling task tracker
- `memory-bank/architecture.md` — System design decisions
- `memory-bank/tech-stack.md` — Technology choices

### Cross-Session Recovery

```bash
# Before ending a session — save context
/cc-best:checkpoint

# Starting a new session — restore context
/cc-best:catchup

# Context getting too long — compress it
/cc-best:compact-context
```

## 7. Quick FAQ

**How do I stop iterate?**
Press Ctrl+C. Progress is automatically saved to `memory-bank/progress.md`. Resume by continuing the conversation or running `/cc-best:catchup`.

**What if QA fails?**
Claude automatically sends it back to Dev for fixing (up to 3 attempts). After that, it asks for your input.

**How do I customize rules?**
Add `.md` files to `rules/`. Use `paths` frontmatter to scope them:

```markdown
---
paths:
  - "**/*.py"
---

# Your Python Rule
```

**Can I use only some roles?**
Yes. Run individual role commands directly: `/cc-best:dev "fix this bug"` skips PM/Lead.

**How do I add a new language?**
Create a new directory under `rules/` (e.g., `rules/rust/`) with style, testing, security, and performance rule files.

---

> **Next**: Read the [Advanced Guide](advanced.md) for deep dives into the methodology, decision principles, and knowledge pipeline.
