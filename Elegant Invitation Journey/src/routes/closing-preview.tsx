import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Microsite, type ClosingStyle } from "@/components/wedding/Microsite";

/**
 * SCRATCH ROUTE — styles for the closing sign-off. The live site is
 * untouched; delete this file once one is chosen.
 */
export const Route = createFileRoute("/closing-preview")({
  head: () => ({
    meta: [{ title: "Closing — preview" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ClosingPreview,
});

const OPTIONS: { key: ClosingStyle; label: string }[] = [
  { key: "card", label: "Current card" },
  { key: "polaroid", label: "9. Polaroid" },
  { key: "envelope", label: "10. Envelope" },
  { key: "medallion", label: "11. Medallion" },
  { key: "sunset", label: "12. Sunset" },
  { key: "letter", label: "5. Letter" },
  { key: "telugu", label: "6. Telugu" },
  { key: "photo", label: "7. Photo" },
  { key: "ribbon", label: "8. Ribbon" },
  { key: "open", label: "1. Open" },
  { key: "arch", label: "2. Arch" },
  { key: "seal", label: "3. Seal" },
  { key: "rose", label: "4. Rose card" },
];

function ClosingPreview() {
  const [style, setStyle] = useState<ClosingStyle>("card");

  useEffect(() => {
    const h = window.location.hash.slice(1) as ClosingStyle;
    if (OPTIONS.some((o) => o.key === h)) setStyle(h);
  }, []);

  // Start at the foot of the page, where the closing sits.
  useEffect(() => {
    const t = window.setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 300);
    return () => window.clearTimeout(t);
  }, [style]);

  const pick = (k: ClosingStyle) => {
    setStyle(k);
    history.replaceState(null, "", `#${k}`);
  };

  return (
    <>
      <Microsite live closingStyle={style} />
      <div
        className="fixed inset-x-0 bottom-0 z-[70] px-3 pt-2.5 font-body text-[0.66rem]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.6rem)",
          background: "oklch(0.18 0.01 20 / 0.92)",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-[26rem] items-center justify-between">
          <span>Closing preview · not the live site</span>
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
      {/* Room so the switcher never covers the last of the page. */}
      <div aria-hidden="true" className="h-24" />
    </>
  );
}
