import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OpenClawApi implements ICredentialType {
  name = 'openClawApi';
  displayName = 'OpenClaw API';
  documentationUrl = 'https://docs.openclaw.ai/gateway/tools-invoke-http-api';

  properties: INodeProperties[] = [
    {
      displayName: 'Gateway URL',
      name: 'gatewayUrl',
      type: 'string',
      default: 'http://127.0.0.1:18789',
      placeholder: 'http://127.0.0.1:18789',
      description: 'The URL of your OpenClaw Gateway. Default port is 18789.',
      required: true,
    },
    {
      displayName: 'Gateway Token',
      name: 'gatewayToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description:
        'The authentication token for your OpenClaw Gateway. Found in your gateway config under gateway.auth.token.',
      required: true,
    },
  ];
}
