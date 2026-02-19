# n8n-nodes-openclaw

[n8n](https://n8n.io/) community nodes for the [OpenClaw](https://github.com/openclaw/openclaw) Gateway API.

Control your OpenClaw instance from n8n workflows — manage sessions, send messages, run cron jobs, search the web, execute commands, and more.

![OpenClaw Node in n8n](https://img.shields.io/badge/n8n-community_node-ff6d5a?logo=n8n)
[![npm version](https://img.shields.io/npm/v/n8n-nodes-openclaw)](https://www.npmjs.com/package/n8n-nodes-openclaw)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)

## Installation

### Community Nodes (recommended)

1. Open **Settings → Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-openclaw`
4. Click **Install**

### Manual Installation

```bash
# In your n8n custom nodes directory
cd ~/.n8n/custom
npm install n8n-nodes-openclaw
```

Or link from source:

```bash
git clone https://github.com/karmaniverous/n8n-nodes-openclaw.git
cd n8n-nodes-openclaw
npm install
npm run build

# Link into n8n
mkdir -p ~/.n8n/custom/node_modules
ln -s "$(pwd)" ~/.n8n/custom/node_modules/n8n-nodes-openclaw
```

Then restart n8n.

## Setup

1. In n8n, go to **Settings → Credentials → Add Credential**
2. Search for **OpenClaw API**
3. Enter your:
   - **Gateway URL** — e.g. `http://127.0.0.1:18789`
   - **Gateway Token** — found in your OpenClaw config file under `gateway.auth.token`

## Available Tools

The OpenClaw node exposes **20 tools** via a Resource dropdown, each with contextual parameters:

| Resource | Description |
|----------|-------------|
| **Agents List** | List available agent IDs for spawning sub-agents |
| **Browser** | Control a browser — open pages, screenshots, snapshots, click, fill forms |
| **Canvas** | Control canvas overlays on paired nodes |
| **Cron** | Manage scheduled jobs — list, add, update, remove, run, wake |
| **Execute Command** | Run shell commands on the host system |
| **Gateway** | Manage the gateway — restart, read/write config, trigger updates |
| **Image** | Analyze images with a vision model |
| **Memory Get** | Read snippets from agent memory files |
| **Memory Search** | Semantically search agent memory |
| **Message** | Send, read, edit, delete messages across channels (Slack, Discord, Telegram, etc.) |
| **Nodes** | Discover and control paired nodes — notifications, camera, location, commands |
| **Process Manager** | Manage running exec sessions — poll, log, write stdin, kill |
| **Session Status** | Get session status, usage stats, and set model overrides |
| **Sessions History** | Retrieve conversation history for a session |
| **Sessions List** | List active sessions with filters |
| **Sessions Send** | Send messages into other sessions (cross-session communication) |
| **Sessions Spawn** | Spawn background sub-agents in isolated sessions |
| **Text to Speech** | Convert text to speech audio |
| **Web Fetch** | Fetch and extract readable content from URLs (HTML → markdown) |
| **Web Search** | Search the web via Brave Search |

### Raw Mode

Every resource supports **Raw Mode** — toggle it on to send arbitrary JSON arguments instead of using the form fields. Useful for edge cases or new parameters not yet in the schema.

## CLI Commands Not in the API

The OpenClaw CLI (`openclaw`) has commands that are **not available** via the Gateway HTTP API — notably `openclaw gateway status`, `openclaw gateway start`, and `openclaw gateway stop`. These manage the local daemon and require OS-level access.

If you need these in a workflow, use n8n's built-in **Execute Command** node to run them directly:

```
openclaw gateway status
```

The CLI does not currently support JSON output, so you'll need to parse the human-readable text.

## Examples

See the [`examples/`](examples/) directory for ready-to-import n8n workflow files:

- **List Sessions** — basic workflow showing session listing
- **Send Slack Message** — send a message to a Slack channel
- **Cron Job Management** — list and run cron jobs
- **Web Search → Message** — search the web and post results to a channel

Import any example via **Workflows → Import from File** in n8n.

## How It Works

This node calls the OpenClaw Gateway's [`POST /tools/invoke`](https://docs.openclaw.ai) endpoint. Each resource/action combination maps to a tool invocation:

```json
{
  "tool": "sessions_list",
  "args": { "limit": 5, "kinds": ["main", "group"] }
}
```

The gateway enforces tool policies, authentication, and session context. See the [OpenClaw docs](https://docs.openclaw.ai) for full API details.

## Development

```bash
git clone https://github.com/karmaniverous/n8n-nodes-openclaw.git
cd n8n-nodes-openclaw
npm install
npm run build
npm test
```

### Project Structure

```
src/
  credentials/          # OpenClaw API credential type
  nodes/OpenClaw/       # Main node implementation
    OpenClaw.node.ts    # Node class with execute function
    toolSchemas.ts      # Static tool schema loader
    openclaw.svg        # Node icon
tool-schemas/           # JSON schema files for each tool (20 files)
examples/               # Example n8n workflows
```

### Running Tests

```bash
npm test                                    # Unit tests
OPENCLAW_TOKEN=<token> npm test             # + integration tests against live gateway
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
npm run knip          # Unused exports/dependencies check
```

## License

[BSD-3-Clause](LICENSE)

## Links

- [OpenClaw](https://github.com/openclaw/openclaw) — the AI agent framework
- [OpenClaw Docs](https://docs.openclaw.ai) — full documentation
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/) — how community nodes work
