/**
 * Tool schema type definition.
 */
export interface ToolParameterDef {
  type: string;
  required?: boolean;
  enum?: string[];
  description?: string;
  default?: unknown;
  placeholder?: string;
  /** If true, the n8n field is a comma-separated string that should be split into an array before sending to the API. */
  splitAsArray?: boolean;
  displayOptions?: {
    show?: {
      action?: string[];
    };
  };
}

export interface ToolSchema {
  name: string;
  label: string;
  description: string;
  actions?: string[];
  parameters: Record<string, ToolParameterDef>;
}

// Import all tool schemas statically.
// These are the enriched schemas extracted from the OpenClaw installation.
import agentsList from '../../../tool-schemas/agents_list.json' with { type: 'json' };
import browser from '../../../tool-schemas/browser.json' with { type: 'json' };
import canvas from '../../../tool-schemas/canvas.json' with { type: 'json' };
import cron from '../../../tool-schemas/cron.json' with { type: 'json' };
import exec from '../../../tool-schemas/exec.json' with { type: 'json' };
import gateway from '../../../tool-schemas/gateway.json' with { type: 'json' };
import image from '../../../tool-schemas/image.json' with { type: 'json' };
import memoryGet from '../../../tool-schemas/memory_get.json' with { type: 'json' };
import memorySearch from '../../../tool-schemas/memory_search.json' with { type: 'json' };
import message from '../../../tool-schemas/message.json' with { type: 'json' };
import nodes from '../../../tool-schemas/nodes.json' with { type: 'json' };
import process from '../../../tool-schemas/process.json' with { type: 'json' };
import sessionStatus from '../../../tool-schemas/session_status.json' with { type: 'json' };
import sessionsHistory from '../../../tool-schemas/sessions_history.json' with { type: 'json' };
import sessionsList from '../../../tool-schemas/sessions_list.json' with { type: 'json' };
import sessionsSend from '../../../tool-schemas/sessions_send.json' with { type: 'json' };
import sessionsSpawn from '../../../tool-schemas/sessions_spawn.json' with { type: 'json' };
import tts from '../../../tool-schemas/tts.json' with { type: 'json' };
import webFetch from '../../../tool-schemas/web_fetch.json' with { type: 'json' };
import webSearch from '../../../tool-schemas/web_search.json' with { type: 'json' };

/**
 * All tool schemas, sorted by label for UI display.
 */
export const toolSchemas: ToolSchema[] = (
  [
    agentsList,
    browser,
    canvas,
    cron,
    exec,
    gateway,
    image,
    memoryGet,
    memorySearch,
    message,
    nodes,
    process,
    sessionStatus,
    sessionsHistory,
    sessionsList,
    sessionsSend,
    sessionsSpawn,
    tts,
    webFetch,
    webSearch,
  ] as unknown as ToolSchema[]
).sort((a, b) => a.label.localeCompare(b.label));
