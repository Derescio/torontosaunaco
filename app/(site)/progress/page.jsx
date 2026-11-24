import Link from "next/link";
import { notFound } from "next/navigation";
import { isProduction } from "../../../lib/env/safety";
import { STAGES, STATUS_LABELS, UPDATED } from "../../../lib/site/progress";
import { cn } from "../../../lib/site/cn";

// Client-facing progress page for the redesign. Staging and previews only.
export const metadata = {
  title: "Website redesign progress",
  robots: { index: false, follow: false },
};

const BADGE = {
  done: "bg-walnut text-white",
  "in-progress": "bg-cream text-walnut ring-1 ring-inset ring-walnut",
  next: "bg-linen text-taupe-500",
};

function Status({ status }) {
  return (
    <span className={cn("inline-flex flex-none items-center rounded-full px-3 py-1 text-caption font-semibold", BADGE[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function stageStatus(stage) {
  if (stage.items.every((i) => i.status === "done")) return "done";
  if (stage.items.some((i) => i.status !== "next")) return "in-progress";
  return "next";
}

export default function ProgressPage() {
  if (isProduction()) notFound();

  return (
    <div className="mx-auto max-w-site px-5 py-16 desktop:px-8 desktop:py-24">
      <p className="text-eyebrow uppercase text-walnut">The Toronto Sauna Co. · New website</p>
      <h1 className="mt-4 max-w-3xl font-display text-display-lg">Redesign progress</h1>
      <p className="mt-5 max-w-2xl text-lead text-taupe-700">
        This is a private preview of the new site while it&apos;s being built. Finished pages have a link; the rest of
        the site still shows the current design until its turn comes.
      </p>
      <p className="mt-3 text-small text-taupe-500">Last updated {UPDATED}</p>

      <ol className="mt-14 grid gap-6 desktop:grid-cols-2">
        {STAGES.map((stage, index) => (
          <li key={stage.title} className="rounded-card border border-line bg-white p-6 desktop:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow uppercase text-taupe-500">Stage {index + 1}</p>
                <h2 className="mt-2 font-display text-heading">{stage.title}</h2>
              </div>
              <Status status={stageStatus(stage)} />
            </div>
            <p className="mt-3 text-body text-taupe-700">{stage.summary}</p>
            <ul className="mt-5 divide-y divide-line border-t border-line">
              {stage.items.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-4 py-3">
                  {item.href ? (
                    <Link href={item.href} className="text-body font-semibold text-walnut underline underline-offset-4 hover:text-ink">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-body">{item.label}</span>
                  )}
                  <Status status={item.status} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
