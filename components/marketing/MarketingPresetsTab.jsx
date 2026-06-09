"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CLICK_ID_OPTIONS,
  PLATFORM_ICONS,
  presetToForm,
} from "./marketing-ui";

function PresetEditor({
  preset,
  form,
  testUrl,
  savingPlatform,
  copiedKey,
  onFormChange,
  onSave,
  onCopy,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{preset.label}</h3>
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Test Preset
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">utm_source</span>
          <input
            type="text"
            value={form.utm_source}
            onChange={(e) =>
              onFormChange(preset.platform, "utm_source", e.target.value)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">utm_medium</span>
          <input
            type="text"
            value={form.utm_medium}
            onChange={(e) =>
              onFormChange(preset.platform, "utm_medium", e.target.value)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">utm_campaign</span>
          <input
            type="text"
            value={form.utm_campaign}
            onChange={(e) =>
              onFormChange(preset.platform, "utm_campaign", e.target.value)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((current) => !current)}
        className="mt-3 inline-flex items-center gap-1 text-sm text-gray-600 transition hover:text-gray-900"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          aria-hidden
        />
        Advanced UTM fields
      </button>

      {showAdvanced && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">utm_term</span>
            <input
              type="text"
              value={form.utm_term}
              onChange={(e) =>
                onFormChange(preset.platform, "utm_term", e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">utm_content</span>
            <input
              type="text"
              value={form.utm_content}
              onChange={(e) =>
                onFormChange(preset.platform, "utm_content", e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">Click ID Type</span>
          <select
            value={form.clickIdKey}
            onChange={(e) =>
              onFormChange(preset.platform, "clickIdKey", e.target.value)
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          >
            {CLICK_ID_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600">Click ID Value</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.clickIdValue}
              onChange={(e) =>
                onFormChange(preset.platform, "clickIdValue", e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-gray-900"
            />
            {form.clickIdValue && (
              <button
                type="button"
                onClick={() => onCopy(form.clickIdValue, `${preset.platform}-clickId`)}
                className="shrink-0 rounded-md border border-gray-300 p-2 text-gray-500 transition hover:border-gray-900"
                aria-label="Copy click ID"
              >
                {copiedKey === `${preset.platform}-clickId` ? (
                  <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave(preset.platform)}
          disabled={savingPlatform === preset.platform}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
        >
          {savingPlatform === preset.platform ? "Saving..." : "Save Preset"}
        </button>
        <Link
          href={testUrl}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-900"
        >
          Test Quote
        </Link>
        <button
          type="button"
          onClick={() => onCopy(testUrl, `${preset.platform}-testUrl`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-900"
        >
          {copiedKey === `${preset.platform}-testUrl` ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden />
              Copy Test URL
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function MarketingPresetsTab({
  presets,
  forms,
  platformStatusMap,
  savingPlatform,
  saveMessage,
  copiedKey,
  onFormChange,
  onSave,
  onCopy,
}) {
  const defaultPlatform = presets[0]?.platform || "google";

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultPlatform} className="w-full">
        <TabsList className="mb-4 grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-gray-200 p-1 sm:grid-cols-4">
          {presets.map((preset) => (
            <TabsTrigger
              key={preset.platform}
              value={preset.platform}
              className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                {PLATFORM_ICONS[preset.platform] || "?"}
              </span>
              <span className="hidden sm:inline">{preset.label}</span>
              <span className="sm:hidden">
                {PLATFORM_ICONS[preset.platform] || preset.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {presets.map((preset) => {
          const form = forms[preset.platform] || presetToForm(preset);
          const testUrl = platformStatusMap[preset.platform]?.testUrl || "/quote";

          return (
            <TabsContent key={preset.platform} value={preset.platform}>
              <PresetEditor
                preset={preset}
                form={form}
                testUrl={testUrl}
                savingPlatform={savingPlatform}
                copiedKey={copiedKey}
                onFormChange={onFormChange}
                onSave={onSave}
                onCopy={onCopy}
              />
            </TabsContent>
          );
        })}
      </Tabs>

      {saveMessage && (
        <p
          className={`text-sm ${saveMessage.includes("saved") ? "text-emerald-600" : "text-red-600"}`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}
