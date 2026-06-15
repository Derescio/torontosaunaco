import { isHubSpotEnabled } from "@/lib/hubspot/enabled";
import { buildContactProperties } from "@/lib/hubspot/buildContactProperties";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

async function hubspotRequest(token, path, options = {}) {
  const response = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body?.message
        ? body.message
        : typeof body === "string"
          ? body
          : JSON.stringify(body);

    const error = new Error(`HubSpot API ${response.status}: ${message}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function upsertContactByEmail(token, email, properties) {
  const result = await hubspotRequest(
    token,
    "/crm/v3/objects/contacts/batch/upsert",
    {
      method: "POST",
      body: JSON.stringify({
        inputs: [
          {
            id: email,
            idProperty: "email",
            properties,
          },
        ],
      }),
    }
  );

  return result?.results?.[0]?.id ?? null;
}

async function createContactNote(token, contactId, noteBody) {
  await hubspotRequest(token, "/crm/v3/objects/notes", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 202,
            },
          ],
        },
      ],
    }),
  });
}

export async function syncSubmissionToHubSpot(data) {
  if (!isHubSpotEnabled()) {
    return null;
  }

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const email = data.email?.trim();

  if (!email) {
    console.warn("HubSpot sync skipped: missing email");
    return null;
  }

  const { core, all, summary } = buildContactProperties(data);

  try {
    const contactId = await upsertContactByEmail(token, email, all);

    if (process.env.HUBSPOT_NOTES_ENABLED === "true" && contactId) {
      try {
        await createContactNote(token, contactId, summary);
      } catch (noteError) {
        console.warn(
          "HubSpot note creation failed; contact was still synced.",
          noteError.message
        );
      }
    }

    return { contactId, mode: "full" };
  } catch (error) {
    try {
      const contactId = await upsertContactByEmail(token, email, {
        ...core,
        website_last_submission: summary,
      });

      console.warn(
        "HubSpot sync stored summary only; create custom contact properties for richer field mapping."
      );

      return { contactId, mode: "summary_only" };
    } catch {
      try {
        const contactId = await upsertContactByEmail(token, email, core);

        console.warn(
          "HubSpot sync used standard contact fields only.",
          error.message
        );

        return { contactId, mode: "core_only" };
      } catch (coreError) {
        console.error("HubSpot contact sync failed:", coreError.message);
        return null;
      }
    }
  }
}
