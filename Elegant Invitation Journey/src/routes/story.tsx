import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import storyAirport from "@/assets/story-airport.jpg";
import storyCamping from "@/assets/story-camping.jpg";
import storyOodenny from "@/assets/story-oodenny.jpg";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * SCRATCH ROUTE — five pinned, scroll-driven ways to tell the story.
 *
 * All of them hold the screen still and change the picture in place, as the
 * current deck does; what differs is how one chapter hands over to the next.
 * No animation library — every motion is derived from scroll position, the
 * same way the existing section works.
 *
 * Delete once a direction is chosen.
 */
export const Route = createFileRoute("/story")({
  head: () => ({ meta: [{ title: "Our story" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: StoryLab,
});

const CHAPTERS = [
  {
    label: "Chapter I",
    title: "The Beginning",
    body: "What began as a casual camping trip to Deception Pass became the first page of our story. Between endless conversations, laughter around the campfire, and a sky full of stars, two strangers from the same college finally found each other.",
    src: storyCamping,
  },
  {
    label: "Chapter II",
    title: "Three Little Words",
    body: "A drive to the Seattle airport. One last hug before goodbye. He held her close and quietly said, “I love you.” Then he simply walked away. She carried those words all the way home — and when her heart was ready, she said “Yes.”",
    src: storyAirport,
  },
  {
    label: "Chapter III",
    title: "Our Sunday Tradition",
    body: "Some love stories are written through grand gestures. Ours was written in slow Sunday mornings. A picnic mat, a good book, coffee in hand, and Mount Rainier watching over us. No plans. No rush. Just us.",
    src: storyOodenny,
  },
];

const N = CHAPTERS.length;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/** Where we are across the chapters: 0 → N-1, fractional between them. */
function usePosition() {
  const [ref, progress] = useScrollProgress<HTMLDivElement>();
  // Hold each chapter still for part of its stretch, so the copy is readable
  // rather than in constant motion.
  const raw = progress * N - 0.5;
  return [ref, Math.min(N - 1, Math.max(0, raw))] as const;
}

/** Copy for one chapter, faded and drifted by how far it is from centre. */
function Copy({ c, at, light = false }: { c: (typeof CHAPTERS)[number]; at: number; light?: boolean }) {
  const d = clamp(Math.abs(at));
  const opacity = 1 - d;
  const shift = at * -40;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 px-7 pb-10 text-center"
      style={{
        opacity,
        transform: `translateY(${shift.toFixed(1)}px)`,
        color: light ? "oklch(0.97 0.01 88)" : undefined,
      }}
    >
      <p
        className="font-body text-[0.55rem] font-medium tracking-[0.26em] uppercase"
        style={{ color: light ? "oklch(0.9 0.02 88)" : "var(--bronze-deep)" }}
      >
        {c.label}
      </p>
      <h3 className={`mt-2 font-display text-[1.6rem] leading-tight ${light ? "" : "text-ink-strong"}`}>
        {c.title}
      </h3>
      <p
        className={`mx-auto mt-3 max-w-[20rem] font-body text-[0.82rem] leading-relaxed ${
          light ? "opacity-90" : "text-muted-foreground"
        }`}
      >
        {c.body}
      </p>
    </div>
  );
}

function Stage({ children }: { children: (pos: number) => React.ReactNode }) {
  const [ref, pos] = usePosition();
  return (
    <div ref={ref} style={{ height: `${N * 110}vh` }}>
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="relative mx-auto h-[86dvh] w-full overflow-hidden rounded-[20px]">
          {children(pos)}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- A — cross-dissolve --------------------------- */
function Dissolve() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          const near = clamp(1 - Math.abs(d));
          return (
            <div key={c.label} className="absolute inset-0" style={{ opacity: ease(near) }}>
              {/* A slow drift while it holds — the picture is never quite static. */}
              <img
                src={c.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: `scale(${1.06 - 0.06 * near})` }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.2 0.02 60 / 0.1) 0%, oklch(0.18 0.02 60 / 0.4) 55%, oklch(0.14 0.02 60 / 0.85) 100%)",
                }}
              />
              <Copy c={c} at={d} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

/* ------------------------------ B — curtain ------------------------------ */
function Curtain() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          // Each picture waits below the frame, then slides up to cover the last.
          const y = d <= 0 ? 0 : clamp(d) * 100;
          return (
            <div
              key={c.label}
              className="absolute inset-0"
              style={{ transform: `translateY(${y.toFixed(1)}%)`, zIndex: 10 + i }}
            >
              <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.2 0.02 60 / 0.1) 0%, oklch(0.18 0.02 60 / 0.42) 55%, oklch(0.14 0.02 60 / 0.86) 100%)",
                }}
              />
              <Copy c={c} at={Math.max(-1, d)} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

/* ----------------------------- C — filmstrip ----------------------------- */
function Filmstrip() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          return (
            <div
              key={c.label}
              className="absolute inset-0"
              style={{ transform: `translateX(${(d * 100).toFixed(1)}%)` }}
            >
              <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.2 0.02 60 / 0.1) 0%, oklch(0.18 0.02 60 / 0.42) 55%, oklch(0.14 0.02 60 / 0.86) 100%)",
                }}
              />
              <Copy c={c} at={0} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

/* ------------------------------- D — cards ------------------------------- */
function CardDeck() {
  const TILT = [-3, 2, -1.5];
  return (
    <Stage>
      {(pos) => (
        <div className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_oklab,var(--ivory)_70%,transparent)]">
          {CHAPTERS.map((c, i) => {
            const d = i - pos;
            // Spent cards swing away to the left; the ones to come wait behind,
            // slightly smaller, so the pile has depth.
            const gone = d < 0;
            const t = clamp(-d);
            return (
              <div
                key={c.label}
                className="absolute h-[72%] w-[80%] rounded-[18px] bg-pearl p-3 pb-4"
                style={{
                  zIndex: 20 - i,
                  transform: gone
                    ? `translateX(${-t * 130}%) rotate(${-t * 18 + TILT[i]}deg)`
                    : `scale(${1 - Math.min(0.14, clamp(d) * 0.07)}) translateY(${clamp(d) * -14}px) rotate(${TILT[i]}deg)`,
                  opacity: gone ? 1 - t : 1,
                  boxShadow: "0 22px 44px -26px oklch(0.28 0.02 60 / 0.55)",
                }}
              >
                <img src={c.src} alt="" className="h-[68%] w-full rounded-[10px] object-cover" />
                <p className="mt-3 text-center font-body text-[0.52rem] font-medium tracking-[0.24em] uppercase text-bronze-deep">
                  {c.label}
                </p>
                <h3 className="mt-1 text-center font-display text-[1.25rem] leading-tight text-ink-strong">
                  {c.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[17rem] text-center font-body text-[0.72rem] leading-snug text-muted-foreground">
                  {c.body.slice(0, 120)}…
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Stage>
  );
}

/* ------------------------------ E — aperture ------------------------------ */
function Aperture() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          const near = clamp(1 - Math.abs(d));
          // The arriving picture opens from the centre; the leaving one closes.
          const r = d > 0 ? (1 - clamp(d)) * 75 : 75 + clamp(-d) * 40;
          return (
            <div
              key={c.label}
              className="absolute inset-0"
              style={{
                zIndex: 10 + i,
                clipPath: `circle(${r.toFixed(1)}% at 50% 45%)`,
                opacity: d < -1 ? 0 : 1,
              }}
            >
              <img
                src={c.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: `scale(${1.1 - 0.1 * near})` }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, oklch(0.2 0.02 60 / 0.1) 0%, oklch(0.18 0.02 60 / 0.42) 55%, oklch(0.14 0.02 60 / 0.86) 100%)",
                }}
              />
              <Copy c={c} at={d} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

const SCRIM =
  "linear-gradient(180deg, oklch(0.2 0.02 60 / 0.1) 0%, oklch(0.18 0.02 60 / 0.42) 55%, oklch(0.14 0.02 60 / 0.86) 100%)";

/* ------------------------------ F — page turn ------------------------------ */
function PageTurn() {
  return (
    <Stage>
      {(pos) => (
        <div className="absolute inset-0" style={{ perspective: "1400px" }}>
          {CHAPTERS.map((c, i) => {
            const d = i - pos;
            const t = clamp(-d); // 0 → 1 as this page turns away
            return (
              <div
                key={c.label}
                className="absolute inset-0 origin-left"
                style={{
                  zIndex: 20 - i,
                  transform: d <= 0 ? `rotateY(${-t * 118}deg)` : "none",
                  opacity: d > 1 ? 0 : 1,
                  backfaceVisibility: "hidden",
                }}
              >
                <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
                {/* A shadow gathers along the spine as the page lifts. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-24"
                  style={{
                    background: "linear-gradient(90deg, oklch(0.1 0.02 60 / 0.55), transparent)",
                    opacity: t,
                  }}
                />
                <Copy c={c} at={Math.min(0, d)} light />
              </div>
            );
          })}
        </div>
      )}
    </Stage>
  );
}

/* -------------------------------- G — split -------------------------------- */
function Split() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          const t = clamp(-d); // how far this picture has parted
          const under = d > 0;
          if (under) {
            return (
              <div key={c.label} className="absolute inset-0" style={{ zIndex: 5 }}>
                <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
                <Copy c={c} at={Math.min(1, d)} light />
              </div>
            );
          }
          return (
            <div key={c.label} className="absolute inset-0" style={{ zIndex: 20 - i }}>
              {/* Two halves of the same picture, parting to let the next through. */}
              {[0, 1].map((half) => (
                <div
                  key={half}
                  className="absolute inset-0"
                  style={{
                    clipPath: half === 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
                    transform: `translateX(${(half === 0 ? -1 : 1) * t * 100}%)`,
                  }}
                >
                  <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
                </div>
              ))}
              <div style={{ opacity: 1 - t }}>
                <Copy c={c} at={0} light />
              </div>
            </div>
          );
        })
      }
    </Stage>
  );
}

/* -------------------------------- H — slats -------------------------------- */
const SLATS = 6;
function Slats() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          if (d > 1) return null;
          const t = clamp(d); // 1 → 0 as this picture arrives
          return (
            <div key={c.label} className="absolute inset-0" style={{ zIndex: 10 + i }}>
              {Array.from({ length: SLATS }, (_, s) => {
                // Staggered, so the slats fall like a shutter rather than together.
                const local = clamp((t - s * 0.06) / (1 - SLATS * 0.06 + 0.06));
                return (
                  <div
                    key={s}
                    className="absolute inset-y-0 overflow-hidden"
                    style={{
                      left: `${(s / SLATS) * 100}%`,
                      width: `${100 / SLATS + 0.2}%`,
                      transform: `translateY(${(local * -100).toFixed(1)}%)`,
                    }}
                  >
                    <img
                      src={c.src}
                      alt=""
                      className="absolute h-full object-cover"
                      style={{ width: `${SLATS * 100}%`, left: `${-s * 100}%` }}
                    />
                  </div>
                );
              })}
              <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
              <Copy c={c} at={d <= 0 ? d : t} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

/* ----------------------------- I — zoom through ----------------------------- */
function ZoomThrough() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          const leaving = clamp(-d);
          const arriving = clamp(d);
          const scale = d <= 0 ? 1 + leaving * 0.6 : 0.72 + (1 - arriving) * 0.28;
          const opacity = d <= 0 ? 1 - leaving : 1 - arriving * 0.9;
          return (
            <div
              key={c.label}
              className="absolute inset-0"
              style={{ zIndex: 10 + i, opacity, transform: `scale(${scale.toFixed(3)})` }}
            >
              <img src={c.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
              <Copy c={c} at={d} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

/* ------------------------------ J — parallax ------------------------------ */
function Parallax() {
  return (
    <Stage>
      {(pos) =>
        CHAPTERS.map((c, i) => {
          const d = i - pos;
          const y = d <= 0 ? clamp(-d) * -34 : clamp(d) * 100; // outgoing drifts, incoming rises
          return (
            <div
              key={c.label}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: 10 + i, transform: `translateY(${y.toFixed(1)}%)` }}
            >
              {/* The picture inside moves against its own frame, so the two
                  layers separate slightly as the panel travels. */}
              <img
                src={c.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transform: `translateY(${(d <= 0 ? clamp(-d) * 16 : clamp(d) * -22).toFixed(1)}%) scale(1.15)` }}
              />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: SCRIM }} />
              <Copy c={c} at={Math.max(-1, Math.min(1, d))} light />
            </div>
          );
        })
      }
    </Stage>
  );
}

const OPTIONS = [
  { key: "dissolve", label: "A · Dissolve", note: "One picture fades into the next, slowly drifting" },
  { key: "curtain", label: "B · Curtain", note: "The next picture rises up over the last" },
  { key: "film", label: "C · Filmstrip", note: "Pictures slide across, as if swiped sideways" },
  { key: "cards", label: "D · Cards", note: "The top card swings away to reveal the next" },
  { key: "aperture", label: "E · Aperture", note: "The next picture opens from the centre" },
  { key: "page", label: "F · Page turn", note: "Each picture turns like a page in an album" },
  { key: "split", label: "G · Split", note: "The picture parts down the middle" },
  { key: "slats", label: "H · Slats", note: "The next picture falls in vertical panels" },
  { key: "zoom", label: "I · Zoom through", note: "You move through one picture into the next" },
  { key: "parallax", label: "J · Parallax", note: "Picture and frame travel at different speeds" },
];

function StoryLab() {
  const [key, setKey] = useState("dissolve");

  return (
    <main className="mx-auto max-w-[26rem]">
      <div className="px-5 pt-10">
        <p className="eyebrow text-center text-muted-foreground">Our story — motion</p>
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {OPTIONS.map((o) => {
            const on = o.key === key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => setKey(o.key)}
                aria-pressed={on}
                className="rounded-full px-3 py-1.5 font-body text-[0.64rem] transition-colors"
                style={{
                  background: on ? "var(--bronze)" : "color-mix(in srgb, white 74%, transparent)",
                  color: on ? "var(--primary-foreground)" : "var(--foreground)",
                  border: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center font-body text-[0.66rem] text-muted-foreground">
          {OPTIONS.find((o) => o.key === key)!.note}
        </p>
        <p className="mt-2 mb-6 text-center font-body text-[0.62rem] text-muted-foreground/70">
          Scroll — the screen holds still and the picture changes in place.
        </p>
      </div>

      {/* Remounted per option so each starts from a clean scroll position. */}
      {key === "dissolve" && <Dissolve key="dissolve" />}
      {key === "curtain" && <Curtain key="curtain" />}
      {key === "film" && <Filmstrip key="film" />}
      {key === "cards" && <CardDeck key="cards" />}
      {key === "aperture" && <Aperture key="aperture" />}
      {key === "page" && <PageTurn key="page" />}
      {key === "split" && <Split key="split" />}
      {key === "slats" && <Slats key="slats" />}
      {key === "zoom" && <ZoomThrough key="zoom" />}
      {key === "parallax" && <Parallax key="parallax" />}

      <p className="px-5 py-14 text-center font-body text-[0.7rem] text-muted-foreground">
        Scroll back up to try another.
      </p>
    </main>
  );
}
