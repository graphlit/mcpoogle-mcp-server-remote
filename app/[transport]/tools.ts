import { Graphlit } from "graphlit-client";
import { z } from "zod";
import {
  ContentFilter,
  SearchTypes,
  RetrievalStrategyTypes,
  RerankingModelServiceTypes,
} from "graphlit-client/dist/generated/graphql-types.js";

export function registerTools(server: any) {
  server.tool(
    "searchMcpServers",
    `Retrieve relevant MCP Servers and Tools from McPoogle search engine. Use this tool to find MCP Servers and Tools that match a given user prompt. The search results will include the name, description, and GitHub URL of each MCP Server.
    Accepts an LLM user prompt for content retrieval. For best retrieval quality, provide only key words or phrases from the user prompt, which will be used to create text embeddings for a vector search query.
    Returns the ranked content sources, including their content resource URI to retrieve the complete Markdown text.`,
    {
      prompt: z.string().describe("LLM user prompt for MCP search."),
    },
    async ({ prompt }: { prompt: string }) => {
      const client = new Graphlit();

      try {
        const filter: ContentFilter = {
          searchType: SearchTypes.Hybrid,
        };

        const response = await client.retrieveSources(
          prompt,
          filter,
          undefined,
          {
            type: RetrievalStrategyTypes.Content, // NOTE: Use Content retrieval strategy to return entire Markdown text
            contentLimit: 50, // number of content sources to retrieve prior to reranking
          },
          {
            serviceType: RerankingModelServiceTypes.Cohere,
          }
        );

        const sources = response.retrieveSources?.results || [];

        return {
          content: sources
            .filter((source) => source !== null)
            .map((source) => ({
              type: "text",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  id: source.content?.id,
                  relevance: source.relevance,
                  text: source.text,
                  resourceUri: `contents://${source.content?.id}`,
                },
                null,
                2
              ),
            })),
        };
      } catch (err: unknown) {
        const error = err as Error;
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
