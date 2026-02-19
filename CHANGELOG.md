# Changelog

## [1.0.0] — Unreleased

### Added

- **OpenClaw node** — single node with resource/action dropdowns covering 20 Gateway API tools
- **OpenClaw API credential** — Gateway URL + Token authentication
- **20 tool schemas** — typed parameters with contextual show/hide per action:
  - `agents_list`, `browser`, `canvas`, `cron`, `exec`, `gateway`, `image`,
    `memory_get`, `memory_search`, `message`, `nodes`, `process`, `session_status`,
    `sessions_history`, `sessions_list`, `sessions_send`, `sessions_spawn`,
    `tts`, `web_fetch`, `web_search`
- **Raw Mode** — bypass typed fields and send arbitrary JSON for any tool
- **Array field handling** — comma-separated string inputs automatically split to arrays
- **Example workflows** — list sessions, send Slack messages, cron management, web search → post
- **CI pipeline** — GitHub Actions for test (Node 20/22) and publish on tag
- **OpenClaw icon** — lobster SVG from the OpenClaw project

### Notes

- The OpenClaw CLI has commands (`gateway status`, `gateway start/stop`) that are not available
  via the HTTP API. Use n8n's built-in Execute Command node to run these directly.
- Tool schemas are hardcoded from OpenClaw's built-in tools. Plugin-registered tools can be
  invoked via Raw Mode. Dynamic tool discovery is planned for a future release.
