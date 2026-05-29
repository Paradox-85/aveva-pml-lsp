import { FastMCP } from 'fastmcp';
import { prompts } from './mcp/prompts.js';
import { resources } from './mcp/resources.js';
import { tools } from './mcp/tools.js';

const server = new FastMCP({
  name: 'PML LSP MCP Server',
  version: '0.1.0',
});

for (const tool of tools) {
  server.addTool(tool as any);
}

for (const resource of resources) {
  server.addResource(resource as any);
}

for (const prompt of prompts) {
  server.addPrompt(prompt as any);
}

const useHttpStream = process.argv.includes('--http-stream') || process.env.MCP_TRANSPORT === 'httpStream';

if (useHttpStream) {
  const port = Number(process.env.PORT ?? 8080);
  server.start({
    transportType: 'httpStream',
    httpStream: { port },
  });
  console.error(`PML LSP MCP server listening on http://localhost:${port}/mcp`);
} else {
  server.start({ transportType: 'stdio' });
}
