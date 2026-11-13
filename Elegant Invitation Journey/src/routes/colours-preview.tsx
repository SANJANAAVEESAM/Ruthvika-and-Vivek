import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Microsite } from "@/components/wedding/Microsite";

/**
 * SCRATCH ROUTE — the whole invitation in alternative colour palettes (defined
 * in styles.css under [data-palette]). The live site is untouched; delete this
 * file and those palette blocks once one is chosen.
 */
export const Route = createFileRoute("/colours-preview")({
  head: () => ({
    meta: [{ title: "Colours — preview" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: ColoursPreview,
});

const PALETTES: { key: string; label: string; swatch: [string, string] }[] = [
  { key: "", label: "Current · Bronze", swatch: ["oklch(0.55 0.09 65)", "oklch(0.965 0.012 80)"] },
  { key: "sage", label: "Sage & Gold", swatch: ["oklch(0.5 0.065 150)", "oklch(0.966 0.012 115)"] },
  { key: "maroon", label: "Maroon & Gold", swatch: ["oklch(0.42 0.13 20)", "oklch(0.966 0.014 75)"] },
  { key: "emerald", label: "Emerald & Gold", swatch: ["oklch(0.43 0.09 165)", "oklch(0.968 0.01 95)"] },
  { key: "rose", label: "Rose & Champagne", swatch: ["oklch(0.56 0.08 10)", "oklch(0.97 0.012 30)"] },
  { key: "navy", label: "Navy & Gold", swatch: ["oklch(0.35 0.08 260)", "oklch(0.968 0.01 85)"] },
  { key: "peacock", label: "Peacock & Gold", swatch: ["oklch(0.47 0.08 210)", "oklch(0.968 0.01 90)"] },
];

function ColoursPreview() {
  const [palette, setPalette] = useState("");

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (PALETTES.some((p) => p.key === h)) setPalette(h);
  }, []);

  // Applied to <html> so every colour on the page follows; removed on leaving.
  useEffect(() => {
    const el = document.documentElement;
    if (palette) el.dataset.palette = palette;
    else delete el.dataset.palette;
    return () => {
      delete el.dataset.palette;
    };
  }, [palette]);

  const pick = (k: string) => {
    setPalette(k);
    history.replaceState(null, "", k ? `#${k}` : "#");
  };

  return (
    <>
      <Microsite live />

      {/* Fixed to the bottom: the site's own menu already holds the top. */}
      <div
        className="fixed inset-x-0 bottom-0 z-[70] px-3 pt-2.5 font-body text-[0.66rem]"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.6rem)",
          background: "oklch(0.18 0.01 60 / 0.92)",
          color: "white",
        }}
      >
        <div className="mx-auto flex max-w-[26rem] items-center justify-between">
          <span>Colour preview · not the live site</span>
          <Link to="/" className="underline underline-offset-2">
            Back to site
          </Link>
        </div>
        <div className="mx-auto mt-2 flex max-w-[26rem] gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {PALETTES.map((p) => (
            <button
              key={p.key || "current"}
              type="button"
              onClick={() => pick(p.key)}
              aria-pressed={palette === p.key}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold whitespace-nowrap"
              style={{
                background: palette === p.key ? "oklch(0.95 0.01 85)" : "oklch(1 0 0 / 0.12)",
                color: palette === p.key ? "oklch(0.2 0.01 60)" : "white",
              }}
            >
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)`, boxShadow: "0 0 0 1px oklch(1 0 0 / 0.5)" }}
              />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
