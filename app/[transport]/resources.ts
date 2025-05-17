import { Graphlit } from "graphlit-client";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    ContentTypes,
    ContentFilter, 
    EntityState,
    GetContentQuery,
} from "graphlit-client/dist/generated/graphql-types.js";

export function registerResources(server: any) {

    server.resource(
    "Contents list: Returns list of content resources.",
    new ResourceTemplate("contents://", {
        list: async (extra) => {
        const client = new Graphlit();
        
        const filter: ContentFilter = { 
            states: [EntityState.Finished], // filter on finished contents only
        };

        try {
            const response = await client.queryContents(filter);
            
            return {
            resources: (response.contents?.results || [])
                .filter(content => content !== null)
                .map(content => ({
                name: content.name,
                description: content.description || '',
                uri: `contents://${content.id}`,
                mimeType: content.mimeType || 'text/markdown'
                }))
            };
        } catch (error) {
            console.error("Error fetching content list:", error);
            return { resources: [] };
        }
        }
    }),
    async (uri: URL, variables: any) => {
        return {
        contents: []
        };
    }
    );
          
    server.resource(
        "Content: Returns content metadata and complete Markdown text. Accepts content resource URI, i.e. contents://{id}, where 'id' is a content identifier.",
        new ResourceTemplate("contents://{id}", { list: undefined }),
        async (uri: URL, variables: any) => {
            const id = variables.id as string;
            const client = new Graphlit();

            try {
                const response = await client.getContent(id);

                return {
                    contents: [
                        {
                            uri: uri.toString(),
                            text: formatContent(response),
                            mimeType: 'text/markdown'
                        }
                    ]
                };
            } catch (error) {
                console.error("Error fetching content:", error);
                return {
                    contents: []
                };
            }
        }
    );
}

function formatContent(response: GetContentQuery): string {
    const results: string[] = [];

    const content = response.content;

    if (!content) {
        return "";
    }

    // Basic content details
    results.push(`**Content ID:** ${content.id}`);
    results.push(`**Name:** ${content.name}`);

    if (content.creationDate) results.push(`**Ingestion Date:** ${content.creationDate}`);

    // Links
    if (content.links && content.type === ContentTypes.Page) {
        results.push(...content.links
            .slice(0, 1000)
            .map(link => `**${link.linkType} Link:** ${link.uri}`));
    }

    if (content.markdown) {
        results.push(content.markdown);
        results.push("\n");
    }

    if (content.customSummary) {
        results.push("**MCP Metadata:**");
        results.push(content.customSummary);
    }
    
    return results.join('\n');
}
