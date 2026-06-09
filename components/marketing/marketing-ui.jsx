import { CheckCircle2, Circle } from "lucide-react";

export const CLICK_ID_OPTIONS = [
  { key: "gclid", label: "Google (gclid)" },
  { key: "fbclid", label: "Facebook / Instagram (fbclid)" },
  { key: "msclkid", label: "Microsoft (msclkid)" },
];

export const PLATFORM_ICONS = {
  google: "G",
  facebook: "f",
  instagram: "IG",
  microsoft: "M",
};

export function formatRelativeTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  return date.toLocaleString();
}

export function formatSubmissionTime(value) {
  if (!value) return "No submissions yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return isToday ? `Today ${time}` : date.toLocaleString();
}

export function presetToForm(preset = {}) {
  return {
    utm_source: preset.utm_source || "",
    utm_medium: preset.utm_medium || "",
    utm_campaign: preset.utm_campaign || "",
    utm_term: preset.utm_term || "",
    utm_content: preset.utm_content || "",
    clickIdKey: preset.clickIdKey || "gclid",
    clickIdValue: preset.clickIdValue || "",
  };
}

export function SuccessBadge({ label = "Success" }) {
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      {label}
    </span>
  );
}

export function StepRow({ label, success, pendingLabel = "Pending" }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-3">
        {success ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
        ) : (
          <Circle className="h-5 w-5 shrink-0 text-gray-300" aria-hidden />
        )}
        <span className="text-sm text-gray-800">{label}</span>
      </div>
      {success ? (
        <SuccessBadge />
      ) : (
        <span className="text-xs text-gray-400">{pendingLabel}</span>
      )}
    </div>
  );
}

export function PlatformRow({ name, captured, icon }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-800">{name}</span>
      </div>
      <span className={`text-sm ${captured ? "text-emerald-600" : "text-red-500"}`}>
        {captured ? "Captured Today" : "Not Captured"}
      </span>
    </div>
  );
}

export function GtmCheckRow({ label, success }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {success ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-gray-300" aria-hidden />
      )}
      <span className="text-sm text-gray-800">{label}</span>
    </div>
  );
}
