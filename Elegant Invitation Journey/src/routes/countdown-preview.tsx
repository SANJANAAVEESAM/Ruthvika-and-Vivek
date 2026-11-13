import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Microsite, type JoinStyle } from "@/components/wedding/Microsite";

/**
 * SCRATCH ROUTE — designs for the "Be part of our beautiful beginning" line,
 * the date and the countdown. The live site is untouched; delete this file
 * once one is chosen.
 */
export const Route = createFileRoute("/countdown-preview")({
  head: () => ({
    meta: [{ title: "Countdown — preview" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CountdownPreview,
});

const OPTIONS: { key: JoinStyle; label: string }[] = [
  { key: "current", label: "Current" },
  { key: "hairline", label: "9. Hairline" },
  { key: "roman", label: "10. Roman" },
  { key: "editorial", label: "11. Editorial" },
  { key: "engraved", label: "12. Engraved" },
  { key: "card", label: "1. Card" },
  { key: "tiles", label: "2. Tiles" },
  { key: "ring", label: "3. Ring" },
  { key: "band", label: "4. Rose band" },
  { key: "flip", label: "5. Flip" },
  { key: "dials", label: "6. Dials" },
  { key: "telugu", label: "7. Telugu" },
  { key: "sentence", label: "8. Sentence" },
];

function CountdownPreview() {
  const [style, setStyle] = useState<JoinStyle>("card");

  useEffect(() => {
    const h = window.location.hash.slice(1) as JoinStyle;
    if (OPTIONS.some((o) => o.key === h)) setStyle(h);
  }, []);

  // Start at the countdown section.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const el = document.getElementById("join");
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60);
    }, 300);
    return () => window.clearTimeout(t);
  }, [style]);

  const pick = (k: JoinStyle) => {
    setStyle(k);
    history.replaceState(null, "", `#${k}`);
  };

  return (
    <>
      <Microsite live joinStyle={style} />
      <div
        className="fixed inset-x-0 bottom-0 z-[70] px-3 pt-2.5 font-body text-[0.66rem]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.6rem)",
          background: "oklch(0.18 0.01 20 / 0.92)",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-[26rem] items-center justify-between">
          <span>Countdown preview · not the live site</span>
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
