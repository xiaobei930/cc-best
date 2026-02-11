# Advanced Guide

> Deep dive into CC-Best's methodology, decision principles, and architecture.

---

## 1. The Dao-Fa-Shu-Qi Philosophy (道法术器)

CC-Best is built on a four-layer philosophy:

```
道 (Dao)  — Philosophy   → Meta principles, core values
法 (Fa)   — Method       → Workflow patterns, role pipelines
术 (Shu)  — Practice     → Coding standards, testing rules
器 (Qi)   — Tools        → Hooks, scripts, automation
```

### Why a Philosophy Matters

AI coding assistants without principles produce inconsistent results. CC-Best embeds guiding principles at every level:

- **Dao** defines 8 core principles (P1-P8) and 5 autonomous decision principles (A1-A5)
- **Fa** translates principles into role workflows (PM → Lead → Dev → QA)
- **Shu** implements standards as enforceable rules (33 rules across 8 directories)
- **Qi** automates enforcement through hooks (18 scripts across 8 lifecycle events)

### Meta Principles

| Principle                | Description                                         |
| ------------------------ | --------------------------------------------------- |
| Let AI do what AI can do | Automate everything automatable                     |
| Context is king          | Garbage in, garbage out — invest in quality context |
| Structure before code    | Plan architecture before implementation             |
| Occam's Razor            | No unnecessary code — simplest solution wins        |

### Core Principles (P1-P8)

| ID  | Principle               | Rule                                                |
| --- | ----------------------- | --------------------------------------------------- |
| P1  | API Handling            | Read docs before calling APIs — **no guessing**     |
| P2  | Execution Confirmation  | Clarify I/O boundaries before execution             |
| P3  | Business Understanding  | Logic from clear requirements — **no assumptions**  |
| P4  | Code Reuse              | Check existing implementations first                |
| P5  | Quality Assurance       | Executable test cases before commit                 |
| P6  | Architecture Compliance | Follow current architecture, no cross-layer calls   |
| P7  | Honest Communication    | Clarify when info is incomplete — **no pretending** |
| P8  | Code Modification       | Analyze dependencies before changes                 |

---

## 2. Role Pipeline Deep Dive

### PM: Autonomous Requirement Analysis

The PM role doesn't just transcribe user requests — it autonomously analyzes:

- Reads project context (architecture.md, tech-stack.md, existing code)
- Infers unstated requirements based on project patterns
- Records each decision with **confidence level** (high/medium/low)
- Creates structured REQ-XXX documents with acceptance criteria
- Integrates `requirement-validator` agent for cross-checking

**Key behavior**: PM never interrupts to ask "what do you mean?" — it infers from context (A1) and records confidence (A2).

### Lead: Technical Design with PM Review

The Lead role reviews PM decisions before designing:

- **Confidence review**: Re-evaluates PM's low/medium confidence decisions
- Creates DES-XXX (design) and TSK-XXX (task) documents
- Decomposes features into implementable units
- Integrates `architect` and `planner` agents for complex designs
- Can adjust PM decisions (A3 downstream correction)

### Designer: UI Guidance (Frontend Only)

Activated only for frontend tasks:

- Uses the `frontend-design` skill for high-quality UI code
- Avoids generic AI aesthetics (no Inter font, no purple gradients)
- Generates production-grade components with distinctive design
- Provides design tokens and component specifications

### Dev: Autonomous Problem Solving

The Dev role handles implementation without interrupting the user:

**Problem-solving framework**:

```
1. Within tech design scope? → Follow the design
2. Similar implementation exists? → Reference existing code
3. Can resolve via docs? → Read docs, then implement
4. Need technical decision? → Choose simplest approach, comment rationale
```

**Key behaviors**:

- Records important decisions in code comments
- Self-reviews code (style, security, performance)
- For frontend: validates in browser (Playwright integration)
- Integrates `code-simplifier` for post-implementation cleanup
- Integrates `tdd-guide` for test-driven development

### QA: Bug Classification

QA doesn't just report bugs — it classifies them:

| Type                             | Description                          | Action                   |
| -------------------------------- | ------------------------------------ | ------------------------ |
| **Implementation Bug**           | Code doesn't match design            | Returns to Dev for fix   |
| **Requirement Assumption Error** | Design was based on wrong assumption | Flags for PM/Lead review |

This classification (A5) prevents the pipeline from spinning in fix-test loops when the real issue is a flawed requirement.

### Document Traceability Chain

```
REQ-001 "User authentication"
 ├→ DES-001 "JWT-based auth with refresh tokens"
 │   ├→ TSK-001 "Implement login endpoint"
 │   ├→ TSK-002 "Implement token refresh"
 │   └→ TSK-003 "Add auth middleware"
 └→ REQ-001-clarify "Password requirements" (if needed)
```

Each document references its parent, creating full traceability from requirement to implementation.

---

## 3. Autonomous Decision Principles (A1-A5)

### A1: Context Inference

**Rule**: Infer from project context — don't interrupt to ask.

**Sources** (in priority order):

1. User's explicit description
2. Existing project implementation patterns
3. `architecture.md` constraints
4. `tech-stack.md` conventions
5. Industry conventions
6. MVP principle (last resort)

**Example**: If the project uses TypeScript everywhere, a new module should use TypeScript without asking.

### A2: Decision Recording

**Rule**: Record rationale and confidence level for every non-trivial decision.

```markdown
<!-- In REQ document -->

**Decision**: Use WebSocket for real-time updates
**Rationale**: Existing chat feature uses WebSocket (src/ws/); consistent with architecture
**Confidence**: High (based on existing pattern)
```

Confidence levels:

- **High**: Based on explicit user input or clear project pattern
- **Medium**: Inferred from related but not identical context
- **Low**: Based on industry convention or MVP principle — marked "TBD"

### A3: Downstream Correction

**Rule**: Each role can correct upstream decisions within its scope.

- **Lead reviews PM**: Can reprioritize tasks, adjust scope, flag unrealistic requirements
- **Dev adjusts Lead design**: Can make minimal changes for implementation feasibility, documents rationale
- **QA distinguishes bug types**: Implementation bugs go back to Dev; assumption errors go back to PM/Lead

This creates a self-correcting pipeline rather than a rigid assembly line.

### A4: MVP Fallback

**Rule**: When no evidence supports a decision, choose the minimal viable approach and mark "TBD".

This prevents:

- Analysis paralysis (spending time on uncertain decisions)
- Baseless assumptions (pretending to know the answer)
- Pipeline blockage (stopping to ask the user)

### A5: Issue Classification

**Rule**: Distinguish implementation bugs from requirement assumption errors.

| Signal                              | Classification     | Action                     |
| ----------------------------------- | ------------------ | -------------------------- |
| Code doesn't match design spec      | Implementation Bug | Dev fixes                  |
| Design spec contradicts user intent | Assumption Error   | PM/Lead reviews            |
| Test passes but behavior is wrong   | Assumption Error   | Requirements re-evaluation |
| Test fails on edge case             | Implementation Bug | Dev fixes                  |

---

## 4. Iterate Mode Mastery

### Complete Execution Flow

```
┌─────────────────────────────────────────┐
│           Iterate Cycle                 │
│                                         │
│  Read progress.md                       │
│       ↓                                 │
│  Select role (8 state conditions)       │
│       ↓                                 │
│  Execute role command                   │
│       ↓                                 │
│  Verify result                          │
│       ↓                                 │
│  Commit changes                         │
│       ↓                                 │
│  Update progress.md                     │
│       ↓                                 │
│  ← Loop back (no waiting) ←            │
│                                         │
│  Stop only when:                        │
│  • All tasks done                       │
│  • User interrupts                      │
│  • Fatal error                          │
│  • External dependency                  │
│  • Context > 70% (prompt user)          │
└─────────────────────────────────────────┘
```

### Role Auto-Selection Logic

The iterate engine evaluates 8 state conditions:

| #   | Condition                    | Role                | Action                                |
| --- | ---------------------------- | ------------------- | ------------------------------------- |
| 1   | No REQ document              | `/cc-best:pm`       | Requirement analysis                  |
| 2   | REQ has low-confidence items | `/cc-best:clarify`  | Requirement clarification             |
| 3   | Has REQ, no DES              | `/cc-best:lead`     | Technical design                      |
| 4   | Has DES, frontend tasks      | `/cc-best:designer` | UI design guidance                    |
| 5   | Has TSK to implement         | `/cc-best:dev`      | Coding + self-test                    |
| 6   | Code ready for verification  | `/cc-best:verify`   | Build + type + lint + test + security |
| 7   | Verification passed          | `/cc-best:qa`       | Functional acceptance                 |
| 8   | QA found implementation bug  | `/cc-best:dev`      | Fix → re-verify                       |

### Context Management Strategy

Iterate mode does **not** proactively `/clear` — it maintains conversation continuity.

When context reaches ~70%:

1. Run `/cc-best:compact-context` to save state and generate summary
2. Prompt user to execute `/clear`
3. User runs `/cc-best:catchup` to restore context
4. Continue iteration

> **Known issue**: Claude Code's auto-compact has a bug ([#18211](https://github.com/anthropics/claude-code/issues/18211)) — `/cc-best:compact-context` may fail above ~85%. Compress at **70%**.

### Progress.md Rolling Window

`memory-bank/progress.md` uses a rolling window to stay manageable:

- Active tasks: Always visible
- Recently completed: Last 10 entries
- Older completions: Archived to `memory-bank/archive/` when file exceeds ~300 lines
- The `auto-archive.js` hook monitors and reminds about archival

### Fault Recovery

If iterate encounters an error:

1. Logs the error in progress.md
2. Attempts auto-resolution (re-run, alternative approach)
3. If unresolvable → marks task as blocked, moves to next task
4. If no more tasks → stops and reports to user

---

## 5. Pair Programming Mastery

### Confirmation Checkpoints vs Safe Autonomy

**Must confirm before**:
| Action | Risk Level | Confirmation |
| ------ | ---------- | ------------ |
| Understanding requirements | — | "I understand you need X. Correct?" |
| Design choice | — | "Option A or B? I recommend A because..." |
| Deleting files/data | High | "About to delete X. Confirm?" |
| Database DDL | High | Show SQL + confirm |
| Production operations | High | Warning + confirm |
| Git history changes | Medium | Explain impact + confirm |
| Dependency upgrades | Medium | Show changes + confirm |
| Config changes | Low | Show diff + confirm |

**Can execute freely**:

- Reading files
- Searching code
- Running tests (read-only)
- Code formatting
- Generating documentation

### Communication Principles

1. **Proactive explanation**: Explain _why_ before _what_
2. **Provide options**: Give context and recommendations with choices
3. **Acknowledge uncertainty**: "I'm not sure. Possible reasons: 1... 2... Want me to investigate?"

### Learning Mode (`--learn`)

When activated, Claude:

- Explains the reasoning behind each step
- Shows intermediate results
- Walks through errors and debugging
- Links to relevant documentation
- Encourages questions

### Switching Between Modes

| Situation                                    | Switch to                         |
| -------------------------------------------- | --------------------------------- |
| Pair → tasks are clear, user trusts approach | `/cc-best:iterate`                |
| Iterate → hit sensitive operation            | Pause, discuss, then resume       |
| Iterate → user wants to understand           | Switch to `/cc-best:pair --learn` |

---

## 6. The Knowledge Evolution Pipeline

CC-Best learns from your development patterns through a four-stage pipeline:

### Stage 1: Observe

The `observe-patterns.js` PostToolUse hook automatically records:

- Tool usage patterns (which tools, how often, in what sequence)
- File modification patterns
- Error recovery patterns
- Command usage frequency

Data is written to `memory-bank/observations.jsonl`.

### Stage 2: Analyze

`/cc-best:analyze` mines multiple sources:

- `observations.jsonl` from the hook
- Git history (commit patterns, file change frequency)
- Error logs
- Session evaluation data (from `evaluate-session.js`)

### Stage 3: Learn

`/cc-best:learn` extracts actionable knowledge:

- Common patterns worth codifying
- Frequent error types and resolutions
- Workflow bottlenecks
- Skill gaps to address

### Stage 4: Evolve

`/cc-best:evolve` transforms knowledge into new components:

- New commands for repeated workflows
- New skills for common patterns
- New agents for specialized tasks
- Updated rules based on learned standards

### Bootstrapping for a New Project

1. Install CC-Best
2. Run initial sessions — hooks automatically start observing
3. After ~10 sessions, run `/cc-best:analyze` for first insights
4. Run `/cc-best:learn` to extract patterns
5. Run `/cc-best:evolve` to generate project-specific components

---

## 7. Memory Architecture

### Three Layers

```
Immediate (current session)
 └→ Short-term (memory-bank/progress.md)
     └→ Long-term (memory-bank/archive/, architecture.md, tech-stack.md)
```

| Layer          | Scope                | Mechanism                                      |
| -------------- | -------------------- | ---------------------------------------------- |
| **Immediate**  | Current conversation | Claude's context window                        |
| **Short-term** | Cross-session tasks  | `progress.md` rolling window                   |
| **Long-term**  | Project knowledge    | `architecture.md`, `tech-stack.md`, `archive/` |

### Rolling Window Archival

`progress.md` stays manageable through rolling archival:

- **Threshold**: ~300 lines triggers archival reminder (via `auto-archive.js` hook)
- **Process**: Completed items older than current phase move to `archive/`
- **Retention**: Active and recently completed items stay in progress.md

### Pre-Compact State Preservation

When context compression occurs, the `pre-compact.js` hook saves:

- Current git status (branch, staged files, uncommitted changes)
- Active todo list
- Current task context
- Timestamp

This state is saved to `.pre-compact-state.json` for recovery via `/cc-best:catchup`.

### Cross-Session Recovery

```bash
# End of session: save context
/cc-best:checkpoint

# Start of new session: restore
/cc-best:catchup
# Reads: progress.md, .pre-compact-state.json, recent git log
# Reconstructs: current task, pending work, recent decisions
```

---

## 8. Hook System Deep Dive

### 8 Lifecycle Events

| Event              | When                       | Purpose                    |
| ------------------ | -------------------------- | -------------------------- |
| `SessionStart`     | Session begins             | Health check, load context |
| `UserPromptSubmit` | User sends message         | Inject project state       |
| `PreToolUse`       | Before tool execution      | Safety validation          |
| `PostToolUse`      | After tool execution       | Formatting, observation    |
| `Stop`             | Response complete          | Check for missed tasks     |
| `SubagentStop`     | Sub-agent completes        | Track sub-agent results    |
| `PreCompact`       | Before context compression | Save state                 |
| `SessionEnd`       | Session ends               | Evaluate and persist       |

### 18 Hook Scripts by Category

**Safety (5 scripts)**:
| Script | Event | Function |
| ------ | ----- | -------- |
| `validate-command.js` | PreToolUse | Block dangerous commands (rm -rf, force push) |
| `pause-before-push.js` | PreToolUse | Confirm before git push |
| `check-secrets.js` | PreToolUse | Detect API keys in commands |
| `protect-files.js` | PreToolUse | Block modification of .env, .key, .git/ |
| `long-running-warning.js` | PreToolUse | Warn about dev servers, watch commands |

**Quality (3 scripts)**:
| Script | Event | Function |
| ------ | ----- | -------- |
| `format-file.js` | PostToolUse | Auto-format after file write |
| `check-console-log.js` | PostToolUse | Flag console.log in JS/TS |
| `typescript-check.js` | PostToolUse | Run tsc --noEmit after .ts edits |

**Learning (2 scripts)**:
| Script | Event | Function |
| ------ | ----- | -------- |
| `observe-patterns.js` | PostToolUse | Track tool usage to observations.jsonl |
| `evaluate-session.js` | SessionEnd | Extract learnable patterns |

**Context Management (5 scripts)**:
| Script | Event | Function |
| ------ | ----- | -------- |
| `session-check.js` | SessionStart | Check file updates, project config |
| `user-prompt-submit.js` | UserPromptSubmit | Inject project state info |
| `auto-archive.js` | PostToolUse | Remind when progress.md > 300 lines |
| `suggest-compact.js` | PostToolUse | Remind to compress context |
| `pre-compact.js` | PreCompact | Save state before compression |

**Tracking (3 scripts)**:
| Script | Event | Function |
| ------ | ----- | -------- |
| `stop-check.js` | Stop | Check for incomplete tasks |
| `subagent-stop.js` | SubagentStop | Record sub-agent task status |
| `session-check.js` | SessionStart | Initial session health check |

### Writing Custom Hooks

Hooks use Node.js with the shared utility library at `scripts/node/lib/utils.js`:

```javascript
#!/usr/bin/env node
const { readStdinJson } = require("../lib/utils.js");

async function main() {
  const input = await readStdinJson();
  // input: { tool_name, tool_input: { file_path, command, ... }, tool_result: { ... } }

  // Your validation logic here
  // To block: output JSON { "decision": "block", "reason": "..." }
  // To allow: exit 0 with no output
}

main();
```

---

## 9. Multi-Language Rules Architecture

### Structure

```
rules/
├── common/           # 7 universal rules (no paths filter)
│   ├── methodology.md
│   ├── coding-standards.md
│   ├── security.md
│   ├── testing.md
│   ├── output-style.md
│   ├── error-handling.md
│   └── performance.md
├── python/           # Python-specific
├── frontend/         # Vue/React/Angular/Svelte
├── java/             # Java/Spring
├── csharp/           # C#/.NET
├── cpp/              # C/C++
├── embedded/         # Embedded systems
└── ui/               # UI/UX standards
```

### Rule Activation

- `common/` rules: **Always loaded** (no `paths` frontmatter)
- Language rules: **Conditionally loaded** via `paths` glob patterns

```markdown
---
paths:
  - "**/*.py"
---

# Python-specific rule activated only for .py files
```

### Four Dimensions per Language

Each language directory covers:

| Dimension       | File Pattern       | Coverage                          |
| --------------- | ------------------ | --------------------------------- |
| **Style**       | `*-style.md`       | Naming, formatting, idioms        |
| **Testing**     | `*-testing.md`     | Framework, coverage, patterns     |
| **Security**    | `*-security.md`    | Language-specific vulnerabilities |
| **Performance** | `*-performance.md` | Optimization, profiling           |

### Adding Rules for a New Language

1. Create directory: `rules/your-lang/`
2. Add style file with `paths` frontmatter:
   ```markdown
   ---
   paths:
     - "**/*.rs"
   ---

   # Rust Coding Standards
   ```
3. Add testing, security, performance files as needed
4. Update `ARCHITECTURE.md` statistics

---

## 10. Agent Strategy

### Model Assignment

| Model      | Agents                                                                | Rationale                                 |
| ---------- | --------------------------------------------------------------------- | ----------------------------------------- |
| **Opus**   | architect, planner, code-reviewer, code-simplifier, security-reviewer | Complex reasoning, architecture decisions |
| **Sonnet** | tdd-guide, build-error-resolver, requirement-validator                | Pattern matching, structured validation   |

### Agent Capabilities

| Agent                   | Purpose                                | Triggered By                   |
| ----------------------- | -------------------------------------- | ------------------------------ |
| `architect`             | System design, ADR creation            | Lead role                      |
| `planner`               | Task decomposition, scheduling         | Lead role                      |
| `code-reviewer`         | Quality + security audit               | Dev/QA roles                   |
| `code-simplifier`       | Reduce complexity, improve readability | Dev role (post-implementation) |
| `security-reviewer`     | OWASP checks, vulnerability scan       | QA role                        |
| `tdd-guide`             | Red-Green-Refactor guidance            | Dev role                       |
| `build-error-resolver`  | Diagnose and fix build failures        | Dev role (on error)            |
| `requirement-validator` | Cross-check requirement consistency    | PM role                        |

### Agent-Skill Preloading

Agents can declare skills in their frontmatter:

```yaml
---
name: code-reviewer
description: Code review agent
tools: [Read, Glob, Grep, Bash]
skills: [security, testing]
---
```

This preloads the specified skills into the agent's context, giving it domain expertise.

---

> **Reference**: Full methodology details in [rules/common/methodology.md](../../rules/common/methodology.md). Mode documentation in [MODES.md](../../.claude-plugin/MODES.md).
