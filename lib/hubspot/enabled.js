export function isHubSpotEnabled() {
  return (
    process.env.HUBSPOT_ENABLED === "true" &&
    Boolean(process.env.HUBSPOT_ACCESS_TOKEN)
  );
}
