import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { EventsSection, type DateStyle } from "@/components/wedding/Microsite";

/**
 * SCRATCH ROUTE — styles for the date selector, on the real events section.
 * The live page is untouched; delete this file once one is chosen.
 */
export const Route = createFileRoute("/celebrations-preview")({
  head: () => ({
    meta: [{ title: "Date buttons — preview" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: DatePreview,
});

const OPTIONS: { key: DateStyle; label: string }[] = [
  { key: "pills", label: "Current" },
  { key: "small", label: "1. Smaller" },
  { key: "underline", label: "2. Underline" },
  { key: "numerals", label: "3. Big dates" },
  { key: "segmented", label: "4. One bar" },
];

function DatePreview() {
  const [style, setStyle] = useState<DateStyle>("small");

  useEffect(() => {
    const h = window.location.hash.slice(1) as DateStyle;
    if (OPTIONS.some((o) => o.key === h)) setStyle(h);
  }, []);

  const pick = (k: DateStyle) => {
    setStyle(k);
    history.replaceState(null, "", `#${k}`);
  };

  return (
    <div className="relative">
      <div
        className="sticky top-0 z-40 px-4 pb-2.5 font-body text-[0.68rem]"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.6rem)",
          background: "color-mix(in oklab, var(--ink-strong) 92%, transparent)",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-[26rem] items-center justify-between gap-3">
          <span>Date button preview</span>
          <Link to="/" className="underline underline-offset-2">
            Back to site
          </Link>
        </div>
        <div className="mx-auto mt-2 flex max-w-[26rem] gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              aria-pressed={style === o.key}
              className="shrink-0 rounded-full px-3 py-1.5 text-[0.62rem] font-semibold whitespace-nowrap transition-colors"
              style={{
                background: style === o.key ? "var(--gold)" : "oklch(1 0 0 / 0.12)",
                color: style === o.key ? "var(--ink-strong)" : "white",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-[26rem]">
        <EventsSection dateStyle={style} />
      </main>
    </div>
  );
}
