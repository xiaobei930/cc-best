# Claude Code Plugin Structure

This directory contains metadata for Claude Code Plugin Marketplace compatibility.

## Files

| File               | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `plugin.json`      | Plugin metadata (name, version, components) |
| `marketplace.json` | Marketplace listing information             |

## Plugin Components

```
/                    # Plugin root
├── commands/        # 30+ slash commands
├── skills/          # 14 development skills
├── agents/          # 6 sub-agents
├── rules/           # 13 coding standards
├── scripts/         # 17 automation scripts
├── hooks/           # Hook configuration and scripts
└── memory-bank/     # Progress persistence

.claude/             # Clone-mode config (auto-loaded by Claude Code)
├── settings.json    # Permission settings
├── mcp-configs/     # MCP server configurations
├── ralph-prompts/   # Ralph Loop prompts
└── learned/         # Continuous learning storage
```

## Usage

This template is designed to be cloned directly. The plugin structure enables future marketplace distribution.

```bash
# Clone and use
git clone https://github.com/xiaobei930/claude-code-best-practices.git my-project
cd my-project && bash scripts/shell/init.sh
```

## Version History

| Version | Changes                  |
| ------- | ------------------------ |
| 1.0.0   | Initial plugin structure |
