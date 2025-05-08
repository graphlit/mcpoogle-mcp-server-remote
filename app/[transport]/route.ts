import { createMcpHandler } from "@vercel/mcp-adapter";
import { registerTools } from './tools';
import { registerResources } from './resources';

const DEFAULT_INSTRUCTIONS = `
You are provided a set of MCP tools and resources that integrate with the [McPoogle](https://www.mcpoogle.com) search engine for MCP Servers and Tools.

To use each of the McPoogle MCP tools, there may be environment variables which are required to be configured in your MCP client. These are described in the description for each tool.
These must be configured in the MCP client YAML or JSON configuration file before you can use the tools. *Do not* set these directly in your Terminal or shell environment.

## Best Practices:
1. Never infer, guess at or hallucinate any URLs.
2. Always attempt to use the most-specific tool for the task at hand.

McPoogle is a search engine for [MCP](https://modelcontextprotocol.io) (Model Context Protocol) Servers and Tools. 

Built by 🦝 in Seattle with [Graphlit](https://www.graphlit.com). 

McPoogle is under active development, and released in ‘alpha’. McPoogle can make mistakes, and may have unscheduled maintenance. Uses data ingested from 7000+ GitHub MCP Server READMEs, MCP docs, and other public sources.

Love it? Hate it? Tell us on the Graphlit [Discord](https://discord.gg/ygFmfjy3Qx) #mcpoogle channel.

### Use Graphlit with Cline, Cursor, Goose, Windsurf and other MCP clients
Try our [Graphlit MCP Server](https://github.com/graphlit/graphlit-mcp-server) today, and please give a GitHub ⭐ if you like it, or hit us on the Graphlit [Discord](https://discord.gg/ygFmfjy3Qx) #mcp channel and tell us why you don't.

Ingest anything from Slack, Discord, websites, Google Drive, email, Jira, Linear or GitHub into a Graphlit project - and then search and retrieve relevant knowledge within an MCP client like Cursor, Windsurf, Goose or Cline.
`

const handler = createMcpHandler(
  (server) => {
    registerTools(server);
    registerResources(server);
  },
  {
    instructions: DEFAULT_INSTRUCTIONS
  },
  {
    streamableHttpEndpoint: "/mcp",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
