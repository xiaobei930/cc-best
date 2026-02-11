# CC-Best Plugin Structure | 插件结构

This directory contains metadata for Claude Code Plugin Marketplace compatibility.
此目录包含 Claude Code 插件市场兼容性所需的元数据。

## Files

| File                    | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `plugin.json`           | Plugin metadata (name, version, components) |
| `marketplace.json`      | Marketplace listing information             |
| `PLUGIN-INTEGRATION.md` | Local components & official plugins guide   |

## Plugin Components

```
/                    # Plugin root
├── commands/        # 35 slash commands
├── skills/          # 17 development skills
├── agents/          # 8 sub-agents
├── rules/           # 14 coding standards
├── scripts/         # 35+ automation scripts
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
git clone https://github.com/xiaobei930/cc-best.git my-project
cd my-project && bash scripts/shell/init.sh
```

## Version History

| Version | Changes                  |
| ------- | ------------------------ |
| 1.0.0   | Initial plugin structure |
