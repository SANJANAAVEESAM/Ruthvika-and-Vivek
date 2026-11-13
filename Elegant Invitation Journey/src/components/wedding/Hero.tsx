import couplePhoto from "@/assets/couple-ruthvika-vivek.jpg";
import { COUPLE } from "./data";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/** How much of its height the card gives up across the scroll, in percent. */
const COLLAPSE = 48;

/**
 * Scene 4 — full-bleed photo card on cream. It stays pinned to the top and
 * collapses in height as you scroll, the type riding its rising bottom edge,
 * until the cream page and the invitation line take over beneath it.
 */
export function Hero({ live }: { live: boolean }) {
  const [wrapRef, progress] = useScrollProgress<HTMLDivElement>();

  return (
    <div ref={wrapRef} id="home" className="relative h-[135vh]">
      {/* Sits above the next section, which is pulled up underneath it — the
          card stays opaque until it has collapsed out of the way. */}
      <div
        className="sticky top-0 z-10 h-[100dvh] p-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div
          className="relative w-full overflow-hidden rounded-[24px]"
          style={{
            height: `${(100 - progress * COLLAPSE).toFixed(2)}%`,
            boxShadow: "var(--shadow-paper)",
          }}
        >
          <img
            src={couplePhoto}
            alt={`${COUPLE.bride} and ${COUPLE.groom} holding their rings together`}
            width={800}
            height={1200}
            className="animate-hero-zoom absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Just enough shading under the type to keep white legible on sand */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 44%, oklch(0.28 0.03 60 / 0.18) 66%, oklch(0.22 0.03 60 / 0.5) 100%)",
            }}
          />

          <div
            className="absolute inset-x-0 bottom-0 px-[7%]"
            style={{
              paddingBottom: "2.75rem",
              opacity: live ? 1 : 0,
              transition: live ? "opacity 1100ms ease 250ms" : undefined,
            }}
          >
            <h1
              // One line: sized to the card so "Ruthvika & Vivek" never wraps.
              className="text-center font-display leading-[1.08] whitespace-nowrap text-white italic"
              style={{
                fontSize: "min(3.5rem, calc((min(100vw, 26rem) - 4rem) / 7.4))",
                // Explicit: the h1 rule's 600 has no italic cut here and would fake-bold.
                fontWeight: 400,
                textShadow: "0 2px 18px oklch(0.24 0.03 60 / 0.4)",
              }}
            >
              {COUPLE.bride} &amp; {COUPLE.groom}
            </h1>

            <div className="mt-7 h-px w-full bg-white/45" />

            <div className="mt-5 flex items-center justify-between">
              <span
                aria-hidden="true"
                className="animate-scroll-nudge font-body text-sm text-white/60"
              >
                ↓
              </span>
              <span className="font-body text-[0.62rem] font-light tracking-[0.34em] text-white/65 uppercase">
                Scroll to Explore
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
