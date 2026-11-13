import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Envelope, type OpeningStyle } from "@/components/wedding/Envelope";

/**
 * SCRATCH ROUTE — options for the mark on the opening screen. The live site is
 * untouched; delete this file once one is chosen.
 */
export const Route = createFileRoute("/opening-preview")({
  head: () => ({
    meta: [{ title: "Opening — preview" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: OpeningPreview,
});

const OPTIONS: { key: OpeningStyle; label: string }[] = [
  { key: "logo", label: "Viru logo" },
  { key: "garden", label: "E. Muggu garden ▶" },
  { key: "envelope", label: "A. Envelope ▶" },
  { key: "doors", label: "B. Temple doors ▶" },
  { key: "curtains", label: "C. Curtains ▶" },
  { key: "book", label: "D. Book ▶" },
  { key: "date", label: "6. Save the date" },
  { key: "blessing", label: "7. Blessing" },
  { key: "rings", label: "8. Rings" },
  { key: "photo", label: "9. Full photo" },
  { key: "framed", label: "10. Framed" },
  { key: "script", label: "1. R & V" },
  { key: "names", label: "2. Names" },
  { key: "telugu", label: "3. Telugu" },
  { key: "arch", label: "4. Arch photo" },
  { key: "seal", label: "5. Seal" },
  { key: "current", label: "Current" },
];

function OpeningPreview() {
  const [style, setStyle] = useState<OpeningStyle>("garden");
  // Bumped after each opening plays, so it resets and can be tapped again.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const h = window.location.hash.slice(1) as OpeningStyle;
    if (OPTIONS.some((o) => o.key === h)) setStyle(h);
  }, []);

  const pick = (k: OpeningStyle) => {
    setStyle(k);
    history.replaceState(null, "", `#${k}`);
  };

  return (
    <>
      <div className="fixed inset-0">
        <Envelope
          key={`${style}-${run}`}
          variant={style}
          silent
          onOpened={() => window.setTimeout(() => setRun((r) => r + 1), 1400)}
        />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 z-[90] px-3 pt-2.5 font-body text-[0.66rem]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.6rem)",
          background: "oklch(0.18 0.01 20 / 0.92)",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-[26rem] items-center justify-between">
          <span>Opening-screen preview · not the live site</span>
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
              className="shrink-0 rounded-full px-3 py-1.5 font-semibold whitespace-nowrap"
              style={{
                background: style === o.key ? "oklch(0.95 0.01 30)" : "oklch(1 0 0 / 0.12)",
                color: style === o.key ? "oklch(0.2 0.01 20)" : "white",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
