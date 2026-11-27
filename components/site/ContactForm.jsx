"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { posthogEvents } from "@/assets/utils/posthogEvents";
import { buildPosthogContext } from "@/assets/utils/posthogContext";
import { buildQuoteSubmissionId, getAttributionForSubmission, pushDataLayerEvent } from "@/assets/utils/marketingAttribution";
import Button from "./Button";
import { Html, INLINE_LINKS } from "./Blocks";
import { cn } from "../../lib/site/cn";
import {
  REASONS,
  TYPES,
  TIMES,
  CONTACT_COPY,
  CAP,
  modeOf,
  defaultReason,
  validate,
  leadEmail,
  newRef,
} from "../../lib/site/contactForm";

// The design's contact form (Contact.dc.html). `copy` comes from Contact.json via ContactPage (server).
// `fallbackEmail` is set only in production; elsewhere a failed send never offers an email link (no team mail
// before cutover).

const EMPTY = { name: "", phone: "", email: "", city: "", type: TYPES[0], time: TIMES[0], when: "", msg: "", hp: "" };
const INPUT = "min-h-11 w-full rounded-md border border-sand-400 bg-white px-3.5 py-3 text-body text-ink";
const INPUT_ERROR = "border-2 border-rust";
const LABEL = "text-small font-semibold text-ink";

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-small text-rust">
          {error}
        </p>
      )}
    </div>
  );
}

const fillTemplate = (html, values) => html.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");

export default function ContactForm({ copy, fallbackEmail = null }) {
  const [values, setValues] = useState({ reason: REASONS[0], ...EMPTY });
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done | failed
  const [ref, setRef] = useState("");
  const fields = { name: useRef(null), email: useRef(null) };

  useEffect(() => {
    // `?msg=` (the Sauna Finder's quote button) fills an empty message box.
    const prefill = new URLSearchParams(window.location.search).get("msg");
    setValues((v) => ({
      ...v,
      reason: defaultReason(`${window.location.hash}${window.location.search}`),
      msg: v.msg || (prefill ? prefill.slice(0, CAP.msg) : ""),
    }));
  }, []);

  const mode = modeOf(values.reason);
  const { errors, clean } = validate(values);
  const shown = tried ? errors : {};
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const errorProps = (key, errorKey = key) =>
    shown[errorKey] ? { "aria-invalid": "true", "aria-describedby": `c-${key}-error` } : { "aria-invalid": "false" };

  async function submit(e) {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTried(true);
      (errors.name ? fields.name : fields.email).current?.focus();
      return;
    }
    const reference = newRef();
    const submissionId = buildQuoteSubmissionId();
    const attribution = getAttributionForSubmission();
    setRef(reference);
    setStatus("sending");
    try {
      const res = await fetch("/api/site/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, ref: reference, submissionId, attribution, sourcePath: window.location.pathname }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json().catch(() => ({}));
      if (data.ref) setRef(data.ref);
      setStatus("done");
      try {
        const context = { submission_id: submissionId, form_id: "site_contact", form_type: "site_contact", subject: values.reason, ...attribution };
        posthog.capture(posthogEvents.quote_form_submitted, { ...buildPosthogContext(window.location.pathname), ...context });
        pushDataLayerEvent("quote_submitted", context);
      } catch {}
    } catch {
      setStatus("failed");
    }
  }

  function again() {
    setValues((v) => ({ reason: v.reason, ...EMPTY }));
    setTried(false);
    setStatus("idle");
    setRef("");
  }

  if (status === "done") {
    const first = clean.name.split(/\s+/)[0] || "there";
    return (
      <div className="flex flex-col items-start gap-4" role="status">
        <Html as="h2" html={fillTemplate(copy.thanks.title, { lfFirst: first })} className="font-display text-display-sm font-medium" />
        <Html as="p" html={fillTemplate(copy.thanks.body, { lfRef: ref })} className="text-body text-taupe-700" />
        <Button variant="dark" size="lg" onClick={again}>
          {copy.again}
        </Button>
      </div>
    );
  }

  const mailto =
    status === "failed" && fallbackEmail
      ? (() => {
          const { subject, text } = leadEmail(clean, ref);
          return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        })()
      : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Html
        as="h2"
        html={copy.titles[mode]}
        className="font-display text-display-sm font-medium [&_em]:italic [&_strong]:font-medium"
      />
      <Html as="p" html={copy.intro} className={cn("text-body text-taupe-700", INLINE_LINKS)} />

      <Field id="c-reason" label={copy.labels.reason}>
        <select id="c-reason" value={values.reason} onChange={set("reason")} className={INPUT}>
          {REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 desktop:grid-cols-2">
        <Field id="c-name" label={copy.labels.name} error={shown.name}>
          <input
            id="c-name"
            ref={fields.name}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            className={cn(INPUT, shown.name && INPUT_ERROR)}
            {...errorProps("name")}
          />
        </Field>
        <Field id="c-phone" label={copy.labels.phone}>
          <input
            id="c-phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            className={cn(INPUT, shown.reach && INPUT_ERROR)}
            {...errorProps("email", "reach")}
          />
        </Field>
      </div>

      <Field id="c-email" label={copy.labels.email} error={shown.reach}>
        <input
          id="c-email"
          ref={fields.email}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          className={cn(INPUT, shown.reach && INPUT_ERROR)}
          {...errorProps("email", "reach")}
        />
      </Field>

      <div className={cn("grid gap-5", mode === "quote" && "desktop:grid-cols-2")}>
        <Field id="c-city" label={copy.labels.city}>
          <input id="c-city" type="text" autoComplete="postal-code" value={values.city} onChange={set("city")} className={INPUT} />
        </Field>
        {mode === "quote" && (
          <Field id="c-type" label={copy.labels.type}>
            <select id="c-type" value={values.type} onChange={set("type")} className={INPUT}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {mode === "visit" && (
        <Field id="c-when" label={copy.labels.when}>
          <input id="c-when" type="text" value={values.when} onChange={set("when")} className={INPUT} />
        </Field>
      )}
      {mode === "quote" && (
        <Field id="c-time" label={copy.labels.time}>
          <select id="c-time" value={values.time} onChange={set("time")} className={INPUT}>
            {TIMES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      )}

      <Field id="c-msg" label={CONTACT_COPY.msgLabel[mode]}>
        <textarea id="c-msg" rows={5} value={values.msg} onChange={set("msg")} className={cn(INPUT, "min-h-32")} />
      </Field>

      {/* Honeypot: off-screen and hidden from assistive tech. Its name and label avoid anything browser autofill
          treats as a name, company or address field, so real visitors never fill it by accident. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-hp">Leave this empty</label>
        <input id="c-hp" name="tsc_hp" type="text" tabIndex={-1} autoComplete="off" value={values.hp} onChange={set("hp")} />
      </div>

      {status === "failed" && (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-rust bg-white px-4 py-3 text-small text-rust">
          <p>{CONTACT_COPY.sendFailed}</p>
          {mailto && (
            <a href={mailto} className="font-semibold text-ink underline">
              {fallbackEmail}
            </a>
          )}
        </div>
      )}

      <div>
        <Button type="submit" variant="dark" size="lg" disabled={status === "sending"}>
          {status === "sending" ? CONTACT_COPY.sending : CONTACT_COPY.button[mode]}
        </Button>
      </div>
    </form>
  );
}
