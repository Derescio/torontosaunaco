import Link from "next/link";
import { CheckCircle2, RefreshCw } from "lucide-react";
import {
  formatSubmissionTime,
  GtmCheckRow,
  PlatformRow,
  PLATFORM_ICONS,
  StepRow,
  SuccessBadge,
} from "./marketing-ui";

export default function MarketingDashboardTab({
  dashboard,
  trackingSteps,
  allOperational,
  lastTestLabel,
  lastSubmissionLabel,
  lastSubmission,
  submissions,
  gtmChecks,
  platformStatusMap,
  onRefresh,
  loading,
}) {
  const contact = lastSubmission?.contact || {};
  const productLabel = lastSubmission?.subject || "Not provided";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:border-gray-900 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh Data
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`h-5 w-5 ${allOperational ? "text-emerald-500" : "text-amber-500"}`}
              aria-hidden
            />
            <h2 className="text-lg font-semibold text-gray-900">Tracking Status</h2>
          </div>

          <div className="mt-5 flex items-start gap-3">
            <CheckCircle2
              className={`mt-0.5 h-8 w-8 shrink-0 ${allOperational ? "text-emerald-500" : "text-amber-500"}`}
              aria-hidden
            />
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {allOperational ? "All Systems Operational" : "Tracking In Progress"}
              </p>
              <p className="mt-1 text-sm text-gray-500">Last Test: {lastTestLabel}</p>
              <p className="text-sm text-gray-500">Last Submission: {lastSubmissionLabel}</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            {trackingSteps.map((step) => (
              <StepRow key={step.label} label={step.label} success={step.success} />
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Attribution Data</h2>

          <div className="mt-4 divide-y divide-gray-100">
            {(dashboard?.presets || []).map((preset) => (
              <PlatformRow
                key={preset.platform}
                name={preset.label}
                captured={platformStatusMap[preset.platform]?.capturedToday}
                icon={PLATFORM_ICONS[preset.platform] || "?"}
              />
            ))}
          </div>

          {lastSubmission?.attribution && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Last Submission Attribution
              </p>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <ul className="space-y-1 font-mono text-xs text-gray-700">
                  {Object.entries(lastSubmission.attribution)
                    .filter(([, value]) => value)
                    .map(([key, value]) => (
                      <li key={key}>
                        {key}={value}
                      </li>
                    ))}
                </ul>
                <p className="text-sm text-gray-600">
                  Detected platform:{" "}
                  <span className="font-medium capitalize text-gray-900">
                    {lastSubmission.detectedPlatform || "unknown"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quote Requests</h2>
          {submissions.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {submissions.map((entry) => (
                <li
                  key={`${entry.submissionId}-${entry.createdAt}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm text-gray-700">
                      {formatSubmissionTime(entry.events?.submittedAt || entry.createdAt)}
                    </p>
                    <p className="text-xs capitalize text-gray-500">
                      {entry.detectedPlatform || "unknown"}
                    </p>
                  </div>
                  <SuccessBadge />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Submit a quote form to populate this list.
            </p>
          )}
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Last Submission Payload</h2>
          {lastSubmission ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">
                  {contact.name || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">
                  {contact.email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Product</dt>
                <dd className="font-medium text-gray-900">{productLabel}</dd>
              </div>
              {lastSubmission?.attribution &&
                Object.values(lastSubmission.attribution).some(Boolean) && (
                  <div>
                    <dt className="text-gray-500">Attribution (first-touch)</dt>
                    <dd className="mt-1 space-y-1 font-mono text-xs text-gray-800">
                      {Object.entries(lastSubmission.attribution)
                        .filter(([, value]) => value)
                        .map(([key, value]) => (
                          <p key={key}>
                            {key}={value}
                          </p>
                        ))}
                    </dd>
                  </div>
                )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No submission payload yet.</p>
          )}

          <Link
            href={
              lastSubmission?.submissionId
                ? `/quote/thank-you?submission=${lastSubmission.submissionId}`
                : "/quote/thank-you"
            }
            className="mt-6 flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:border-gray-900 hover:bg-gray-50"
          >
            View Thank-You Page
          </Link>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Google Tag Manager</h2>
          <div className="mt-4">
            {gtmChecks.map((item) => (
              <GtmCheckRow key={item.label} label={item.label} success={item.success} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
