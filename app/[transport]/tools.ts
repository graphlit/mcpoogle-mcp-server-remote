import { Graphlit } from "graphlit-client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { 
    ContentFilter, 
    SearchTypes, 
    RetrievalStrategyTypes, 
    RerankingModelServiceTypes 
} from "graphlit-client/dist/generated/graphql-types.js";

export function registerTools(server: McpServer) {
    server.tool(
    "searchMcpServers",
    `Retrieve relevant MCP Servers and Tools from McPoogle search engine. Use this tool to find MCP Servers and Tools that match a given user prompt. The search results will include the name, description, and GitHub URL of each MCP Server.
    Accepts an LLM user prompt for content retrieval. For best retrieval quality, provide only key words or phrases from the user prompt, which will be used to create text embeddings for a vector search query.
    Returns the ranked content sources, including their content resource URI to retrieve the complete Markdown text.`,
    { 
        prompt: z.string().describe("LLM user prompt for MCP search.")
    },
    async ({ prompt }) => {
        const client = new Graphlit();

        console.log(`searchMcpServers: ${prompt}`);

        try {
        const filter: ContentFilter = { 
            searchType: SearchTypes.Hybrid,
        };

        const response = await client.retrieveSources(prompt, filter, undefined, { 
            type: RetrievalStrategyTypes.Section
        }, 
        { 
            serviceType: RerankingModelServiceTypes.Cohere 
        });
        
        const sources = response.retrieveSources?.results || [];
        
        return {
            content: sources
            .filter(source => source !== null)
            .map(source => ({
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify({ 
                id: source.content?.id, 
                relevance: source.relevance,
                resourceUri: `contents://${source.content?.id}`, 
                text: source.text, 
                mimeType: "text/markdown"
                }, null, 2)
            }))
        };
        } catch (err: unknown) {
        const error = err as Error;
        return {
            content: [{
            type: "text",
            text: `Error: ${error.message}`
            }],
            isError: true
        };
        }
    }
    );   
}