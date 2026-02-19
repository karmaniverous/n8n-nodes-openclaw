import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
} from 'n8n-workflow';
import { type JsonObject, NodeApiError } from 'n8n-workflow';

import { toolSchemas } from './toolSchemas.js';

/**
 * Build n8n node properties from tool schemas.
 */
function buildResourceOptions() {
  return toolSchemas.map((schema) => ({
    name: schema.label,
    value: schema.name,
    description: schema.description,
  }));
}

/**
 * Build action (operation) options for a specific tool.
 */
function buildActionProperties() {
  const properties: INodeTypeDescription['properties'] = [];

  for (const schema of toolSchemas) {
    if (!schema.actions) continue;

    properties.push({
      displayName: 'Action',
      name: 'action',
      type: 'options',
      displayOptions: {
        show: { resource: [schema.name] },
      },
      options: schema.actions.map((action: string) => ({
        name: action.charAt(0).toUpperCase() + action.slice(1),
        value: action,
      })),
      default: schema.actions[0],
      noDataExpression: true,
      required: true,
      description: `The ${schema.label} operation to perform`,
    });
  }

  return properties;
}

/**
 * Build parameter fields for each tool, respecting displayOptions.
 */
function buildParameterProperties() {
  const properties: INodeTypeDescription['properties'] = [];

  for (const schema of toolSchemas) {
    const params = schema.parameters;

    for (const [paramName, paramDef] of Object.entries(params)) {
      // Skip 'action' — already handled above
      if (paramName === 'action') continue;
      // Skip gateway override params — handled by credentials
      if (paramName === 'gatewayUrl' || paramName === 'gatewayToken') continue;

      const displayOptions: IDataObject = {
        show: { resource: [schema.name] },
      };

      // If the param has its own displayOptions.show.action, merge it
      if (paramDef.displayOptions?.show?.action) {
        (displayOptions.show as IDataObject).action =
          paramDef.displayOptions.show.action;
      }

      const n8nType = mapType(paramDef.type);

      const prop: IDataObject = {
        displayName: formatDisplayName(paramName),
        name: paramName,
        type: n8nType,
        displayOptions,
        default: paramDef.default ?? (n8nType === 'boolean' ? false : ''),
        required: paramDef.required ?? false,
        description: paramDef.description ?? '',
      };

      if (paramDef.enum && n8nType === 'options') {
        prop.options = paramDef.enum.map((v: string) => ({
          name: v.charAt(0).toUpperCase() + v.slice(1),
          value: v,
        }));
      }

      if (paramDef.placeholder) {
        prop.placeholder = paramDef.placeholder;
      }

      // For object/json types, use the json type
      if (paramDef.type === 'object') {
        prop.type = 'json';
        prop.default = '{}';
      }

      properties.push(
        prop as unknown as INodeTypeDescription['properties'][number],
      );
    }
  }

  return properties;
}

function mapType(schemaType: string): string {
  switch (schemaType) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'json';
    default:
      return 'string';
  }
}

function formatDisplayName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export class OpenClaw implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenClaw',
    name: 'openClaw',
    icon: 'file:openclaw.svg',
    group: ['transform'],
    version: 1,
    subtitle:
      '={{$parameter["resource"] + ": " + ($parameter["action"] || "execute")}}',
    description: 'Interact with the OpenClaw Gateway API',
    defaults: {
      name: 'OpenClaw',
    },
    inputs: ['main' as NodeConnectionType],
    outputs: ['main' as NodeConnectionType],
    credentials: [
      {
        name: 'openClawApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector (tool)
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: buildResourceOptions(),
        default: 'sessions_list',
        required: true,
        description: 'The OpenClaw tool to invoke',
      },
      // Raw mode option
      {
        displayName: 'Raw Mode',
        name: 'rawMode',
        type: 'boolean',
        default: false,
        description:
          'Whether to send raw JSON arguments instead of using the form fields. Useful for tools not yet supported with typed fields.',
      },
      {
        displayName: 'Raw Arguments (JSON)',
        name: 'rawArgs',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: { rawMode: [true] },
        },
        description: 'Raw JSON arguments to pass to the tool',
      },
      // Action selectors per resource
      ...buildActionProperties(),
      // Parameter fields per resource
      ...buildParameterProperties(),
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('openClawApi');
    const gatewayUrl = credentials.gatewayUrl as string;
    const gatewayToken = credentials.gatewayToken as string;

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i);
        const rawMode = this.getNodeParameter('rawMode', i, false) as boolean;

        let args: IDataObject;

        if (rawMode) {
          const rawArgs = this.getNodeParameter('rawArgs', i, '{}') as string;
          args = JSON.parse(rawArgs) as IDataObject;
        } else {
          args = buildArgsFromParameters.call(this, resource, i);
        }

        const body: IDataObject = {
          tool: resource,
          args,
        };

        // If there's an action, also set it at the top level
        if (args.action) {
          body.action = args.action;
        }

        const options: IHttpRequestOptions = {
          method: 'POST',
          url: `${gatewayUrl.replace(/\/$/, '')}/tools/invoke`,
          body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gatewayToken}`,
          },
          json: true,
        };

        const response = (await this.helpers.httpRequest(options)) as {
          ok?: boolean;
          result?: IDataObject;
          error?: { message?: string };
        };

        if (response.ok === false) {
          throw new NodeApiError(
            this.getNode(),
            response as unknown as JsonObject,
            {
              message: response.error?.message ?? 'Unknown error',
            },
          );
        }

        returnData.push({
          json: (response.result ?? response) as unknown as IDataObject,
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

/**
 * Build args object from n8n parameter values for a given resource.
 */
function buildArgsFromParameters(
  this: IExecuteFunctions,
  resource: string,
  itemIndex: number,
): IDataObject {
  const schema = toolSchemas.find((s) => s.name === resource);
  if (!schema) return {};

  const args: IDataObject = {};

  // Get action if this tool has actions
  if (schema.actions && schema.actions.length > 0) {
    try {
      args.action = this.getNodeParameter('action', itemIndex) as string;
    } catch {
      // action not available for this resource
    }
  }

  // Get each parameter
  for (const [paramName, paramDef] of Object.entries(schema.parameters)) {
    if (paramName === 'action') continue;
    if (paramName === 'gatewayUrl' || paramName === 'gatewayToken') continue;

    try {
      const value = this.getNodeParameter(paramName, itemIndex, undefined) as
        | string
        | number
        | boolean
        | IDataObject
        | undefined;
      if (value !== undefined && !(typeof value === 'string' && value === '')) {
        // Parse JSON strings for object types
        if (paramDef.type === 'object' && typeof value === 'string') {
          try {
            args[paramName] = JSON.parse(value) as unknown as IDataObject;
          } catch {
            args[paramName] = value;
          }
        } else {
          args[paramName] = value as unknown as IDataObject;
        }
      }
    } catch {
      // Parameter not available (hidden by displayOptions)
    }
  }

  return args;
}
