import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const OPEN_VOLUNTEERING_API = "https://query20251112104247-h6affebdd4gfa4bs.uksouth-01.azurewebsites.net";

const server = new McpServer({ name: "mcpservername1", version: "0.0.0" });

server.registerTool(
  "searchVolunteeringOrganisationsByName",
  {
    title: "Search Volunteer Involving Organisations (VIO) by name",
    description:
      "This tool takes a single input parameter to search VIOs by name; it returns a list of Volunteer Involving Organisations whose name includes the input parameter.",
    inputSchema: { name: z.string() },
  },
  async (input) => {
    const url = `${OPEN_VOLUNTEERING_API}/organisation_by_name?name=${input.name}`;
    const data = await makeVolunteeringRequest<OrganisationsResponse>(url);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve VIO data",
          },
        ],
      };
    }

    const organisations = data.organisations || [];
    if (organisations.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No Volunteer Involving Organisations matching name ${input.name}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(organisations),
        },
      ],
    };
  }
);

server.registerTool(
  "getVolunteeringOrganisationById",
  {
    title: "Get Volunteer Involving Organisations (VIO) details by ID",
    description:
      "This tool takes a single input parameter to retrieve a VIO by id; it returns the detailed information about that Volunteer Involving Organisation.",
    inputSchema: { id: z.string() },
  },
  async (input) => {
    const url = `${OPEN_VOLUNTEERING_API}/organisation_by_id?id=${input.id}`;
    const data = await makeVolunteeringRequest<OrganisationResponse>(url);

    if (!data) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve VIO data",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);



async function makeVolunteeringRequest<T>(url: string): Promise<T | null> {
  const headers = { Accept: "application/json" };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making request:", error);
    return null;
  }
}

interface OrganisationsResponse {
  organisations: Organisation[];
}

interface Organisation {
  id: string;
  name: string;
}

interface OrganisationResponse {
  id: string;
  name: string;
  description: string;
  purpose: string;
  website: string;
}
