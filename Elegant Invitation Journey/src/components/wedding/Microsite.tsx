import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  CONTACT_EMAIL,
  CONTACTS,
  COUPLE,
  DESIGNER,
  DESIGNER_URL,
  DETAIL_CARDS,
  type DetailIcon,
  EVENT_DAYS,
  FULL_WEDDING_CAL,
  GALLERY_FOLDERS,
  bookByLabel,
  HOTELS,
  hotelHref,
  WEDDING_DATE_RANGE,
  WEDDING_YEAR,
  WHATSAPP_NUMBER,
  venueMapsHref,
  type EventDay,
  type WeddingEvent,
} from "./data";
import { AddToCalendar } from "./AddToCalendar";
import { Confetti } from "./Confetti";
import { Countdown } from "./Countdown";
import { DressCodeArt } from "./DressCodeArt";
import { FloatingNav } from "./FloatingNav";
import { Hero } from "./Hero";
import { Modal } from "./Modal";
import { MusicToggle } from "./MusicToggle";
import { Ornament } from "./Ornament";
import { Petals } from "./Petals";
import { Reveal } from "./Reveal";
import { EVENT_THEMES, EventScenery } from "./eventThemes";
import popupPhoto from "@/assets/couple-ruthvika-vivek.jpg";
import { copyText } from "@/lib/clipboard";
import { submitRsvp } from "@/lib/rsvp";

/* ---------------------------------- shell ---------------------------------- */

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`w-full px-5 py-24 ${className}`}>
      <Reveal>{children}</Reveal>
    </section>
  );
}

/** Fixed botanical watermark that breathes in after the hero — background never "changes". */
function BotanicalWatermark() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setOpacity(Math.min(0.06, Math.max(0, (window.scrollY - window.innerHeight * 0.6) / window.innerHeight) * 0.06)),
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 140"
      className="pointer-events-none fixed -right-16 -bottom-16 -z-10 w-[24rem]"
      style={{ opacity, transition: "opacity 300ms linear" }}
    >
      <g fill="none" stroke="var(--foreground)" strokeWidth="1">
        <path d="M18 126 C36 96 40 66 30 34" />
        <path d="M30 62 c-14 -2 -22 6 -24 16 c12 2 20 -6 24 -16" />
        <path d="M33 44 c12 -6 24 -2 28 8 c-12 4 -22 0 -28 -8" />
        <path d="M96 118 C104 96 118 84 132 80" />
        <path d="M112 96 c-2 -12 4 -20 14 -24 c2 10 -4 18 -14 24" />
      </g>
    </svg>
  );
}

/* ---------------------------------- join us ---------------------------------- */

/**
 * The turn toward the schedule: the invitation line, the date and the live
 * countdown. Confetti fires once per page load, when the guest reaches this.
 */
function JoinUs() {
  const ref = useRef<HTMLElement>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setCelebrate(true);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden px-6 py-20 text-center"
    >
      {celebrate && <Confetti />}

      <Reveal>
        {/* One gap value, so the spacing between every element is identical */}
        <div className="flex flex-col items-center gap-9">
          <p
            className="font-accent-soft leading-snug text-foreground"
            style={{
              // 1.8rem chosen on /fonts; the vw term only eases it down on
              // phones too narrow to hold the line in two.
              fontSize: "clamp(1.45rem, 5.4vw + 0.6rem, 1.8rem)",
              // Italic 300 is the cut auditioned, and both are loaded — unlike
              // Marcellus, this family has real italics, so nothing is faked.
              fontStyle: "italic",
              fontWeight: 300,
              letterSpacing: "-0.01em",
            }}
          >
            Be part of our beautiful beginning
          </p>
          <p
            className="font-display leading-tight lowercase first-letter:uppercase text-foreground"
            style={{ fontSize: "clamp(1.8rem, 8vw, 2.15rem)" }}
          >
            {WEDDING_DATE_RANGE}
          </p>
          <Countdown />
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------- events ---------------------------------- */

/** Fades its children in each time it mounts — used when the day changes. */
function FadeIn({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(10px)",
        transition: "opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * The schedule, one day at a time. Guests pick a date and that day's
 * celebrations are listed beneath it — name and venue on the left, the time
 * set apart on the right, like a printed order of events.
 */
export function EventsSection({
  heading,
  // The couple's rings photograph, faded behind an ivory veil.
  popupBackground = "photo",
  // One slim bar split three ways, the chosen day filled in bronze.
  dateStyle = "segmented",
}: { heading?: ReactNode; popupBackground?: PopupBackground; dateStyle?: DateStyle } = {}) {
  const [dayIdx, setDayIdx] = useState(0);
  const activeDay = EVENT_DAYS[dayIdx];
  const [open, setOpen] = useState<{ event: WeddingEvent; day: EventDay } | null>(null);

  return (
    <section
      id="events"
      className="flex min-h-[100dvh] w-full flex-col justify-center px-6"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 5rem)",
        // Generous room below, so Additional details reads as a new section.
        paddingBottom: "calc(env(safe-area-inset-bottom) + 5rem)",
      }}
    >
      <Reveal>
        {heading ?? (
          <div className="relative py-6 text-center">
            {/* "Our Pelli Gola", in Telugu. */}
            <h2
              lang="te"
              aria-label="Maa Pelli Gola: our wedding celebrations"
              className="relative leading-none text-bronze"
              // Explicit 400: the global h2 rule asks for 600, which Suravaram
              // doesn't have, so the browser would fake a bold.
              style={{ fontFamily: '"Suravaram", serif', fontSize: "clamp(2.4rem, 11vw, 2.9rem)", fontWeight: 400 }}
            >
              మా పెళ్లి గోల
            </h2>
            {/* One line of fine capitals, sized so it always fits the screen. */}
            <p
              className="relative mt-[0.6rem] font-display leading-none whitespace-nowrap uppercase"
              style={{
                fontSize: "min(0.92rem, calc((100vw - 3.5rem) / 28))",
                fontWeight: 500,
                letterSpacing: "0.3em",
                color: "color-mix(in oklab, var(--ink-strong) 62%, transparent)",
              }}
            >
              Your calendar for this November
            </p>
          </div>
        )}
        <Ornament className="mt-4 mb-8" />

        <DayPicker style={dateStyle} dayIdx={dayIdx} onPick={setDayIdx} />

        <FadeIn key={activeDay.date}>
          <div
            className="mt-8"
            style={{ borderTop: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)" }}
          >
            {activeDay.events.map((event) => {
              const directions = venueMapsHref(event.venue);
              const isMain = Boolean(event.timeLabel);
              return (
                // The whole row opens the details; a div rather than a button so
                // the Directions link inside it stays a real link.
                <div
                  key={event.slug}
                  role="button"
                  tabIndex={0}
                  aria-label={`${event.name}: see details`}
                  onClick={() => setOpen({ event, day: activeDay })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen({ event, day: activeDay });
                    }
                  }}
                  className="grid cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 py-7 transition-opacity active:opacity-70"
                  style={{ borderBottom: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)" }}
                >
                  <div className="min-w-0">
                    <p className="font-body text-[0.54rem] font-medium tracking-[0.36em] uppercase text-muted-foreground">
                      {activeDay.weekday} · {activeDay.date}
                    </p>
                    <h3
                      className={`mt-2 font-display leading-none text-ink-strong ${isMain ? "text-[2.2rem] font-medium" : "text-[1.7rem]"}`}
                    >
                      {event.name}
                    </h3>
                    <p className="mt-2 font-display text-[1rem] text-muted-foreground italic">
                      {event.venue.name}
                      {event.venue.address ? `, ${event.venue.address}` : ""}
                    </p>
                    {event.note && (
                      <p className="mt-0.5 font-display text-[1rem] text-muted-foreground italic">{event.note}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen({ event, day: activeDay });
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-[0.54rem] font-medium tracking-[0.26em] uppercase text-bronze-deep transition-colors active:scale-[0.97]"
                        style={{
                          background: "transparent",
                          border: "1px solid color-mix(in oklab, var(--gold) 70%, transparent)",
                        }}
                      >
                        View details <span aria-hidden="true">→</span>
                      </button>
                      {directions && (
                        <a
                          href={directions}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="inline-block font-body text-[0.56rem] font-medium tracking-[0.28em] uppercase text-bronze-deep underline underline-offset-[6px]"
                          style={{
                            textDecorationColor: "color-mix(in oklab, var(--gold) 70%, transparent)",
                            textDecorationThickness: "1px",
                          }}
                        >
                          Directions
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {event.timeLabel && (
                      <p className="font-body text-[0.5rem] font-medium tracking-[0.3em] uppercase text-bronze-deep">
                        {event.timeLabel}
                      </p>
                    )}
                    <p
                      className={`font-display leading-none font-light whitespace-nowrap text-ink-strong ${isMain ? "text-[1.9rem]" : "text-[1.4rem]"}`}
                    >
                      {event.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        <div className="mt-8 text-center">
          <AddToCalendar compact event={FULL_WEDDING_CAL} />
        </div>
      </Reveal>

      <EventDetails open={open} onClose={() => setOpen(null)} background={popupBackground} />
    </section>
  );
}

/** How the day selector is drawn — see DayPicker. */
export type DateStyle = "pills" | "small" | "underline" | "numerals" | "segmented";

/** The row of dates that chooses which day's celebrations are listed. */
function DayPicker({
  style,
  dayIdx,
  onPick,
}: {
  style: DateStyle;
  dayIdx: number;
  onPick: (i: number) => void;
}) {
  const short = (date: string) => date.replace(" November", " Nov");
  const gold = (pct: number) => `color-mix(in oklab, var(--gold) ${pct}%, transparent)`;

  if (style === "underline") {
    // Plain text tabs; the chosen day is inked and underlined in gold.
    return (
      <div className="flex justify-center gap-7">
        {EVENT_DAYS.map((d, i) => {
          const on = i === dayIdx;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              className="pb-1.5 font-body text-[0.66rem] font-medium tracking-[0.24em] uppercase transition-colors"
              style={{
                color: on ? "var(--ink-strong)" : "var(--muted-foreground)",
                borderBottom: `1px solid ${on ? "var(--bronze)" : "transparent"}`,
              }}
            >
              {short(d.date)}
            </button>
          );
        })}
      </div>
    );
  }

  if (style === "numerals") {
    // The date itself as the button: a light numeral over its weekday.
    return (
      <div className="flex justify-center gap-8">
        {EVENT_DAYS.map((d, i) => {
          const on = i === dayIdx;
          const [num] = d.date.split(" ");
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              aria-label={`${d.weekday}, ${d.date}`}
              className="flex flex-col items-center transition-opacity"
              style={{ opacity: on ? 1 : 0.45 }}
            >
              <span
                className="font-display text-[2.1rem] leading-none font-light"
                style={{ color: on ? "var(--bronze-deep)" : "var(--ink-strong)" }}
              >
                {num}
              </span>
              <span className="mt-1 font-body text-[0.5rem] font-medium tracking-[0.26em] uppercase text-muted-foreground">
                {d.weekday.slice(0, 3)} · Nov
              </span>
              <span
                aria-hidden="true"
                className="mt-2 size-1 rotate-45 transition-opacity"
                style={{ background: "var(--bronze)", opacity: on ? 1 : 0 }}
              />
            </button>
          );
        })}
      </div>
    );
  }

  if (style === "segmented") {
    // One slim bar, split three ways; the chosen day is a filled segment.
    return (
      <div
        className="mx-auto flex w-fit rounded-full p-1"
        style={{ border: `1px solid ${gold(45)}`, background: "color-mix(in oklab, var(--ivory) 60%, transparent)" }}
      >
        {EVENT_DAYS.map((d, i) => {
          const on = i === dayIdx;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              className="rounded-full px-4 py-1.5 font-body text-[0.6rem] font-medium tracking-[0.18em] uppercase transition-colors"
              style={{
                background: on ? "var(--bronze)" : "transparent",
                color: on ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {short(d.date)}
            </button>
          );
        })}
      </div>
    );
  }

  // "pills" (the original) and "small", a slimmer version of it.
  const small = style === "small";
  return (
    <div className={`flex justify-center ${small ? "gap-1.5" : "gap-2"}`}>
      {EVENT_DAYS.map((d, i) => {
        const on = i === dayIdx;
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={on}
            className={`rounded-full font-body uppercase transition-colors ${
              small
                ? "px-3.5 py-1.5 text-[0.62rem] font-medium tracking-[0.16em]"
                : "px-5 py-3 text-[0.82rem] font-semibold tracking-[0.08em]"
            }`}
            style={{
              background: on ? "var(--bronze)" : "color-mix(in oklab, var(--ivory) 62%, transparent)",
              color: on ? "var(--primary-foreground)" : "var(--muted-foreground)",
              boxShadow: on && !small ? "0 6px 16px -8px oklch(0.4 0.06 60 / 0.5)" : "none",
              border: `1px solid ${on ? "transparent" : gold(38)}`,
            }}
          >
            {short(d.date)}
          </button>
        );
      })}
    </div>
  );
}

/** How the event pop-up is backed — see EventDetails. */
export type PopupBackground = "art" | "ivory" | "wash" | "photo" | "faint";

/** A gentle colour per event for the "wash" background. */
const WASHES: Record<string, { ground: string; ink: string; inkSoft: string; accent: string }> = {
  carnival: {
    ground: "radial-gradient(130% 80% at 50% 0%, oklch(0.96 0.06 95) 0%, oklch(0.93 0.08 88) 60%, oklch(0.9 0.09 82) 100%)",
    ink: "oklch(0.2 0.03 60)",
    inkSoft: "oklch(0.32 0.04 62)",
    accent: "oklch(0.5 0.12 60)",
  },
  masquerade: {
    ground: "radial-gradient(130% 80% at 50% 0%, oklch(0.3 0.06 268) 0%, oklch(0.22 0.06 266) 60%, oklch(0.18 0.05 264) 100%)",
    ink: "oklch(0.95 0.012 88)",
    inkSoft: "oklch(0.82 0.02 90)",
    accent: "oklch(0.8 0.07 85)",
  },
  pellikuthuru: {
    ground: "radial-gradient(130% 80% at 50% 0%, oklch(0.97 0.025 140) 0%, oklch(0.94 0.04 140) 60%, oklch(0.91 0.05 138) 100%)",
    ink: "oklch(0.2 0.03 150)",
    inkSoft: "oklch(0.32 0.04 148)",
    accent: "oklch(0.45 0.09 145)",
  },
  telugu: {
    ground: "radial-gradient(130% 80% at 50% 0%, oklch(0.97 0.02 70) 0%, oklch(0.94 0.035 50) 60%, oklch(0.91 0.045 40) 100%)",
    ink: "oklch(0.2 0.05 30)",
    inkSoft: "oklch(0.32 0.05 32)",
    accent: "oklch(0.42 0.14 28)",
  },
};

/** A fine gold frame inset from the card's edge, for the plainer backgrounds. */
function GoldFrame({ color = "var(--gold)" }: { color?: string }) {
  return (
    <span
      className="absolute inset-3 rounded-[20px]"
      style={{ border: `1px solid color-mix(in oklab, ${color} 60%, transparent)` }}
    />
  );
}

/**
 * One celebration in full: its own illustrated setting behind it, the details
 * set like an invitation card, and buttons for directions and the calendar.
 */
function EventDetails({
  open,
  onClose,
  background = "art",
}: {
  open: { event: WeddingEvent; day: EventDay } | null;
  onClose: () => void;
  background?: PopupBackground;
}) {
  // Kept after closing so the panel still has content while it slides away.
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) setShown(open);
  }, [open]);

  const event = shown?.event;
  const day = shown?.day;
  const theme = event ? EVENT_THEMES[event.themeKey] : null;

  // The ground behind the details, and the ink that reads on it.
  let look: { ink: string; inkSoft: string; accent: string } | null = theme;
  let panelStyle = theme?.surface;
  let backdrop: ReactNode = event ? <EventScenery theme={event.themeKey} /> : null;
  let padTop = event?.themeKey === "telugu" ? "pt-20" : "pt-12";

  if (event && theme && background !== "art") {
    const neutral = { ink: "oklch(0.2 0.02 60)", inkSoft: "oklch(0.34 0.025 62)", accent: "var(--bronze-deep)" };
    padTop = "pt-8";
    if (background === "ivory") {
      look = neutral;
      panelStyle = {
        background:
          "radial-gradient(130% 80% at 50% 0%, oklch(0.985 0.008 85) 0%, oklch(0.965 0.014 82) 60%, oklch(0.95 0.02 80) 100%)",
      };
      backdrop = <GoldFrame />;
    } else if (background === "wash") {
      const w = WASHES[event.themeKey] ?? WASHES.telugu;
      look = w;
      panelStyle = { background: w.ground };
      backdrop = <GoldFrame color={w.accent} />;
    } else if (background === "photo") {
      look = neutral;
      panelStyle = { background: "var(--ivory)" };
      backdrop = (
        <>
          <img
            src={popupPhoto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 30%", filter: "grayscale(0.2)" }}
          />
          <span
            className="absolute inset-0"
            style={{ background: "color-mix(in oklab, var(--ivory) 84%, transparent)" }}
          />
          <GoldFrame />
        </>
      );
    } else if (background === "faint") {
      // The same artwork, washed well back behind a veil of the card's own ground.
      const dark = event.themeKey === "masquerade";
      padTop = event.themeKey === "telugu" ? "pt-20" : "pt-12";
      backdrop = (
        <>
          <EventScenery theme={event.themeKey} />
          <span
            className="absolute inset-0"
            style={{
              background: dark
                ? "color-mix(in oklab, oklch(0.2 0.06 266) 62%, transparent)"
                : "color-mix(in oklab, oklch(0.97 0.012 85) 66%, transparent)",
            }}
          />
        </>
      );
    }
  }

  const accent = look?.accent;
  const directions = event ? venueMapsHref(event.venue) : null;
  const place = event ? [event.venue.name, event.venue.address].filter(Boolean).join(", ") : "";

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      label={event?.name ?? "Event"}
      variant="card"
      panelStyle={panelStyle}
      backdrop={backdrop}
    >
      {event && day && look && (
        // Starts clear of the lanterns, arch and emblem at the top of each artwork.
        <div className={`relative text-center ${padTop}`} style={{ color: look.ink }}>
          <div className="w-full">
            <p
              className="font-body text-[0.56rem] font-medium tracking-[0.34em] uppercase"
              style={{ color: look.inkSoft }}
            >
              {day.weekday} · {day.date} {WEDDING_YEAR}
            </p>
            <h3
              className={`mx-auto mt-3 max-w-[17rem] font-display font-medium ${
                event.fullName ? "text-[1.85rem] leading-[1.1]" : "text-[2.3rem] leading-none"
              }`}
            >
              {event.fullName ?? event.name}
            </h3>
            {event.teluguName && (
              <p
                lang="te"
                className="mt-2 text-[1.35rem] leading-snug"
                style={{ fontFamily: '"Suravaram", serif', fontWeight: 400, color: accent }}
              >
                {event.teluguName}
              </p>
            )}
            <span
              aria-hidden="true"
              className="mx-auto mt-5 mb-5 block h-px w-20"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
            />

            {/* The formal invitation, where one is set — the wedding. Leads,
                straight after the title, before anything else is said. */}
            {event.invitation && (
              <div className="mb-6">
                <p
                  className="mx-auto max-w-[16rem] font-display text-[1.02rem] leading-snug italic"
                  style={{ color: look.inkSoft }}
                >
                  {event.invitation.lead}
                </p>
                <p className="mt-3 font-display text-[1.7rem] leading-tight">
                  {event.invitation.parties.map((p) => p.name).join(" & ")}
                </p>
                <span
                  aria-hidden="true"
                  className="mx-auto mt-6 block h-px w-12"
                  style={{ background: accent, opacity: 0.5 }}
                />
              </div>
            )}

            {/* A few lines about the celebration — English, then Telugu. */}
            {(event.about || event.aboutTe) && (
              <div className="mx-auto mb-6 max-w-[18rem] space-y-3">
                {event.about && (
                  <p className="font-display text-[1.02rem] leading-snug" style={{ color: look.inkSoft }}>
                    {event.about}
                  </p>
                )}
                {event.aboutTe && (
                  <p
                    lang="te"
                    className="text-[0.92rem] leading-relaxed"
                    style={{ fontFamily: '"Suravaram", serif', fontWeight: 400, color: look.inkSoft }}
                  >
                    {event.aboutTe}
                  </p>
                )}
              </div>
            )}

            {/* The key moments of the ceremony. */}
            {event.rituals && (
              <div className="mx-auto mb-7 max-w-[17rem]">
                <p
                  className="font-body text-[0.54rem] font-medium tracking-[0.36em] uppercase"
                  style={{ color: accent }}
                >
                  The rituals
                </p>
                <ul className="mt-3 space-y-2.5">
                  {event.rituals.map((r) => (
                    <li key={r.name} className="leading-snug">
                      <span className="flex items-center justify-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-1 shrink-0 rotate-45"
                          style={{ background: accent }}
                        />
                        <span className="font-display text-[1.1rem]">{r.name}</span>
                      </span>
                      {r.detail && (
                        <span className="block font-display text-[0.95rem] italic" style={{ color: look.inkSoft }}>
                          {r.detail}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.timeLabel && (
              <p
                className="font-body text-[0.56rem] font-medium tracking-[0.4em] uppercase"
                style={{ color: accent }}
              >
                {event.timeLabel}
              </p>
            )}
            <p className="mt-1 font-display text-[2.1rem] leading-none font-light">{event.time}</p>
            {event.note && (
              <p className="mt-2 font-display text-[1.02rem] italic" style={{ color: look.inkSoft }}>
                {event.note}
              </p>
            )}

            <span
              aria-hidden="true"
              className="mx-auto mt-5 mb-5 block h-px w-12"
              style={{ background: accent, opacity: 0.5 }}
            />

            <p className="font-display text-[1.3rem] leading-tight">{event.venue.name}</p>
            {event.venue.address && (
              <p
                className="mt-1 font-body text-[0.62rem] tracking-[0.22em] uppercase"
                style={{ color: look.inkSoft }}
              >
                {event.venue.address}
              </p>
            )}

            {event.attire && (
              <div className="mt-5">
                <p
                  className="font-body text-[0.54rem] font-medium tracking-[0.36em] uppercase"
                  style={{ color: accent }}
                >
                  Attire
                </p>
                <p className="mt-1 font-display text-[1.05rem] italic">{event.attire}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col items-center gap-2.5">
              {directions && (
                <a
                  href={directions}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border bg-ivory/90 px-6 py-3 font-body text-[0.62rem] font-medium tracking-[0.22em] uppercase shadow-sm transition-all active:scale-[0.98]"
                  style={{ color: "var(--ink-strong)", borderColor: "color-mix(in oklab, var(--gold) 55%, transparent)" }}
                >
                  Get directions <span aria-hidden="true">↗</span>
                </a>
              )}
              <AddToCalendar
                compact
                event={{
                  title: `${event.name} · ${COUPLE.bride} & ${COUPLE.groom}`,
                  description: [
                    `${event.name} for the wedding of ${COUPLE.bride} & ${COUPLE.groom}.`,
                    event.timeLabel ? `${event.timeLabel}: ${event.time}.` : "",
                    event.note ?? "",
                  ]
                    .filter(Boolean)
                    .join(" "),
                  location: place,
                  startUtc: event.start.toISOString(),
                  endUtc: event.end.toISOString(),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------ detail cards ------------------------------ */

const iconStroke = {
  fill: "none",
  stroke: "var(--gold)",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Gold line drawings, one per card — nothing photographic. */
const DETAIL_ICONS: Record<DetailIcon, ReactNode> = {
  bed: (
    <g {...iconStroke}>
      <path d="M4 26V8M4 26h40v-8a5 5 0 0 0-5-5H20v13" />
      <path d="M44 26v4M4 26v4" />
      <circle cx="12" cy="17" r="3.4" />
    </g>
  ),
  plane: (
    <g {...iconStroke}>
      <path d="M3 21l42-12M3 21l8 4 6-3M45 9l-9 15-5-9" />
      <path d="M17 22l4 7 3-5" />
    </g>
  ),
  camera: (
    <g {...iconStroke}>
      <path d="M4 13.5a2.5 2.5 0 0 1 2.5-2.5H13l2.6-3.6h16.8L35 11h6.5a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-2.5 2.5h-35A2.5 2.5 0 0 1 4 27.5v-14z" />
      <circle cx="24" cy="20.5" r="6.4" />
      <path d="M37.5 16h2.5" />
    </g>
  ),
  pin: (
    <g {...iconStroke}>
      <path d="M24 31.5s10.5-9.6 10.5-17.2a10.5 10.5 0 1 0-21 0C13.5 21.9 24 31.5 24 31.5z" />
      <circle cx="24" cy="14" r="4.1" />
    </g>
  ),
};

function DetailIconArt({ icon, className = "h-10 w-auto" }: { icon: DetailIcon; className?: string }) {
  return (
    <svg viewBox="0 0 48 34" className={className} aria-hidden="true">
      {DETAIL_ICONS[icon]}
    </svg>
  );
}

function DetailCards() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const active = openIdx !== null ? DETAIL_CARDS[openIdx] : null;

  return (
    <>
      <Section id="details">
      <h2
        className="text-center font-display leading-none lowercase first-letter:uppercase text-foreground"
        style={{ fontSize: "clamp(2.1rem, 10vw, 2.6rem)" }}
      >
        additional details
      </h2>
      <Ornament className="mt-4 mb-8" />

      <div className="grid grid-cols-2 gap-3.5">
        {DETAIL_CARDS.map((card, i) => (
          <button
            key={card.title}
            type="button"
            onClick={() => setOpenIdx(i)}
            className="relative flex flex-col items-center justify-center gap-3 rounded-2xl px-4 py-7 text-center transition-transform active:scale-[0.99]"
            style={{
              background: "color-mix(in oklab, var(--ivory) 68%, transparent)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              border: "1px solid color-mix(in oklab, var(--gold) 34%, transparent)",
              boxShadow: "0 10px 26px -16px oklch(0.32 0.03 60 / 0.4)",
            }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "var(--gradient-gold)" }}
            />
            <DetailIconArt icon={card.icon} />
            <span className="block font-display text-[1.25rem] leading-tight lowercase first-letter:uppercase text-foreground">
              {card.title}
            </span>
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-bronze/12 text-[0.85rem] text-bronze"
            >
              +
            </span>
          </button>
        ))}
      </div>
      </Section>

      <Modal
        open={active !== null}
        onClose={() => setOpenIdx(null)}
        label={active?.title ?? "Details"}
        variant="full"
      >
        {active && (
          <div className="flex min-h-full flex-col pt-6 pb-4 text-center">
            <div className="my-auto w-full">
              <DetailIconArt icon={active.icon} className="mx-auto h-16 w-auto" />
              <h3 className="mt-6 font-display text-[2.1rem] leading-tight lowercase first-letter:uppercase text-foreground">
                {active.title}
              </h3>
              <Ornament className="mt-5 mb-7" />
              {/* Paragraphs are blank-line separated in the copy, and it now
                  runs long enough that centring every line would hurt to read. */}
              <p className="mx-auto max-w-[20rem] text-left font-body text-[0.95rem] leading-relaxed whitespace-pre-line text-muted-foreground">
                {active.body}
              </p>

              {active.venues && <VenueList />}
              {active.gallery && <GalleryList />}
              {active.hotels && <HotelList />}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

/**
 * Every venue in running order, one row each, with directions.
 *
 * The venue is the row's subject rather than the event, so it carries the
 * weight — the event name sits above it as the label. Each row keeps its date:
 * a flat list reads more cleanly than day-grouped headings, but without the
 * date a guest cannot tell which venue belongs to which morning.
 */
function VenueList() {
  // Events sharing a venue collapse into one row — "Haldi & Mehendi" rather
  // than the same address twice. Driven by an explicit flag rather than by
  // comparing venues, so that two celebrations only ever merge because someone
  // said they belong together, never because their addresses happened to match.
  const rows: { dates: string[]; names: string[]; event: WeddingEvent }[] = [];
  EVENT_DAYS.forEach((day) =>
    day.events.forEach((event) => {
      const previous = rows[rows.length - 1];
      if (event.sharesVenueWithPrevious && previous) {
        previous.names.push(event.name);
        if (!previous.dates.includes(day.date)) previous.dates.push(day.date);
      } else {
        rows.push({ dates: [day.date], names: [event.name], event });
      }
    }),
  );

  return (
    <div className="mx-auto mt-9 max-w-[20rem] text-left">
      <p className="mb-1 font-body text-[0.58rem] font-medium tracking-[0.26em] uppercase text-muted-foreground">
        Venues
      </p>

      {rows.map(({ dates, names, event }, i) => {
        const directions = venueMapsHref(event.venue);
        const label = names.join(" & ");
        return (
          <div
            key={event.slug}
            className="flex items-center justify-between gap-3 py-3.5"
            style={{
              borderTop:
                i === 0 ? "none" : "1px solid color-mix(in oklab, var(--gold) 28%, transparent)",
            }}
          >
            <div className="min-w-0">
              {/* The date stays quiet so the bold event name reads as the label
                  for the venue below, rather than the two competing. */}
              <p className="font-body text-[0.58rem] tracking-[0.18em] uppercase text-muted-foreground">
                {dates.map((d) => d.replace(" November", " Nov")).join(" & ")}
                <span aria-hidden="true"> · </span>
                <span className="font-bold text-foreground/75">{label}</span>
              </p>

              {/* The venue is what this list is for, so it is the loudest line. */}
              <p
                className={
                  directions
                    ? "mt-1 font-display text-[1.15rem] leading-tight font-semibold text-ink-strong"
                    : "mt-1 font-display text-[1.1rem] leading-tight text-muted-foreground italic"
                }
              >
                {event.venue.name}
              </p>

              {event.venue.address && (
                <p className="mt-0.5 truncate font-body text-[0.74rem] leading-snug text-muted-foreground">
                  {event.venue.address}
                </p>
              )}
            </div>

            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                aria-label={`Directions to ${event.venue.name} for ${label}`}
                className="shrink-0 rounded-full px-3.5 py-2 font-body text-[0.62rem] font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-90"
                style={{ background: "var(--bronze)", color: "var(--primary-foreground)" }}
              >
                Map
              </a>
            ) : (
              <span className="shrink-0 font-body text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground/70">
                TBA
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Nearby hotels, each opening its own Google Maps place page.
 *
 * The hotel holding a rate for our guests is lifted out of the list into a
 * card of its own. A discount announced in a row identical to four others is
 * a discount most guests scroll past, and this one expires — so it is given
 * the weight the rest of the site gives a celebration, and it goes first.
 */
function HotelList() {
  // flatMap rather than filter so the booking narrows to non-optional and the
  // card below can read it without asserting what the filter already proved.
  const featured = HOTELS.flatMap((hotel) =>
    hotel.booking ? [{ ...hotel, booking: hotel.booking }] : [],
  );
  const rest = HOTELS.filter((hotel) => !hotel.booking);

  return (
    <div className="mx-auto mt-5 max-w-[20rem] text-left">
      {featured.map((hotel) => (
        <div
          key={hotel.name}
          className="relative overflow-hidden rounded-2xl px-4 pt-4 pb-4"
          style={{
            background: "color-mix(in oklab, var(--gold) 10%, var(--background))",
            border: "1px solid color-mix(in oklab, var(--gold) 38%, transparent)",
            boxShadow: "0 10px 26px -16px oklch(0.32 0.03 60 / 0.4)",
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "var(--gradient-gold)" }}
          />

          <p className="font-body text-[0.54rem] font-medium tracking-[0.28em] uppercase text-bronze">
            Special rate for our guests
          </p>

          <p className="mt-1.5 font-display text-[1.18rem] leading-tight font-semibold text-ink-strong">
            {hotel.label}
          </p>

          {/* Deadline and map on one line: two short facts, and stacking them
              cost a row that the panel could not spare. */}
          <p className="font-body text-[0.72rem] leading-snug text-muted-foreground">
            Book by{" "}
            <span className="font-semibold text-bronze-deep">
              {bookByLabel(hotel.booking.deadline)}
            </span>
            <span aria-hidden="true"> · </span>
            <a
              href={hotelHref(hotel.name)}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 decoration-bronze/40"
            >
              See on map
            </a>
          </p>

          <a
            href={hotel.booking.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-full items-center justify-center rounded-full px-4 py-2.5 font-body text-[0.6rem] font-medium tracking-[0.16em] uppercase"
            style={{ background: "var(--bronze)", color: "var(--primary-foreground)" }}
          >
            Book with our discount
          </a>
        </div>
      ))}

      <p className="mt-5 mb-0.5 font-body text-[0.54rem] font-medium tracking-[0.26em] uppercase text-muted-foreground">
        {featured.length > 0 ? "Others nearby" : "Nearby hotels"}
      </p>

      {rest.map((hotel, i) => (
        <a
          key={hotel.name}
          href={hotelHref(hotel.name)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 py-2.5"
          style={{
            borderTop:
              i === 0 ? "none" : "1px solid color-mix(in oklab, var(--gold) 28%, transparent)",
          }}
        >
          <span className="min-w-0 truncate font-display text-[1.02rem] leading-tight font-semibold text-ink-strong">
            {hotel.label}
          </span>

          {/* A pin rather than a filled pill: five bronze buttons down the list
              shouted louder than the one button that actually books a room. */}
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center gap-1 font-body text-[0.6rem] font-medium tracking-[0.14em] uppercase text-bronze"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Map
          </span>
        </a>
      ))}
    </div>
  );
}

/** One row per shared folder, in the order the celebrations happen. */
function GalleryList() {
  return (
    <div className="mx-auto mt-8 max-w-[20rem] text-left">
      <p className="mb-1 font-body text-[0.58rem] font-medium tracking-[0.26em] uppercase text-muted-foreground">
        Shared folders
      </p>

      {GALLERY_FOLDERS.map((folder, i) => (
        <div
          key={folder.url}
          className="flex items-center justify-between gap-3 py-3.5"
          style={{
            borderTop:
              i === 0 ? "none" : "1px solid color-mix(in oklab, var(--gold) 28%, transparent)",
          }}
        >
          <p className="min-w-0 font-display text-[1.15rem] leading-tight font-semibold text-ink-strong">
            {folder.label}
          </p>

          <a
            href={folder.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open the shared photo folder for ${folder.label}`}
            className="shrink-0 rounded-full px-3.5 py-2 font-body text-[0.62rem] font-medium tracking-[0.14em] uppercase transition-opacity hover:opacity-90"
            style={{ background: "var(--bronze)", color: "var(--primary-foreground)" }}
          >
            Open
          </a>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------- faqs ----------------------------------- */

function Faqs() {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  return (
    <>
      <Section id="faqs" className="text-center">
      <h2
        className="font-display leading-none lowercase first-letter:uppercase text-foreground"
        style={{ fontSize: "clamp(2.4rem, 12vw, 3rem)" }}
      >
        questions?
      </h2>
      <p className="mx-auto mt-5 max-w-[20rem] font-body text-sm leading-relaxed text-muted-foreground">
        Anything at all about the celebrations — travel, timings, what to wear — just ask us.
      </p>
      <button
        type="button"
        onClick={() => setContactOpen(true)}
        className="mt-7 rounded-full bg-bronze px-7 py-3.5 font-body text-[0.64rem] font-medium tracking-[0.22em] uppercase text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99]"
      >
        Reach out to {CONTACTS.map((c) => c.name).join(" or ")}
      </button>
      </Section>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)} label="Contact us">
        <div className="flex flex-col items-center gap-5 pt-3 pb-4 text-center">
          <p className="font-display text-2xl text-foreground">We'd love to hear from you</p>

          {/* Numbers first: most guests opening this want to call or message,
              and a tel: link dials straight from a phone. */}
          <div className="w-full">
            {CONTACTS.map((person, i) => (
              <div
                key={person.tel}
                className="flex items-center justify-between gap-3 py-3"
                style={{
                  borderTop:
                    i === 0 ? "none" : "1px solid color-mix(in oklab, var(--gold) 28%, transparent)",
                }}
              >
                <div className="text-left">
                  <p className="font-display text-[1.15rem] leading-tight font-semibold text-ink-strong">
                    {person.name}
                  </p>
                  <p className="font-body text-[0.78rem] text-muted-foreground">{person.display}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <a
                    href={`tel:${person.tel}`}
                    aria-label={`Call ${person.name}`}
                    className="rounded-full px-3.5 py-2 font-body text-[0.6rem] font-medium tracking-[0.14em] uppercase"
                    style={{ background: "var(--bronze)", color: "var(--primary-foreground)" }}
                  >
                    Call
                  </a>
                  <a
                    href={`https://wa.me/${(person.whatsapp ?? person.tel).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Message ${person.name} on WhatsApp`}
                    className="rounded-full border px-3.5 py-2 font-body text-[0.6rem] font-medium tracking-[0.14em] uppercase text-bronze-deep"
                    style={{ borderColor: "color-mix(in oklab, var(--gold) 45%, transparent)" }}
                  >
                    Chat
                  </a>
                </div>
              </div>
            ))}
          </div>

          {CONTACT_EMAIL && (
          <>
          <span
            aria-hidden="true"
            className="block h-px w-12"
            style={{ background: "var(--gold)", opacity: 0.55 }}
          />

          <p className="font-body text-sm break-all text-muted-foreground">{CONTACT_EMAIL}</p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={async () => {
                setCopied((await copyText(CONTACT_EMAIL)) ? "done" : "failed");
                setTimeout(() => setCopied("idle"), 2400);
              }}
              className="rounded-lg border border-[var(--silver)]/60 bg-ivory px-5 py-2.5 font-body text-[0.62rem] font-medium tracking-[0.2em] uppercase text-foreground/80"
            >
              {copied === "done" ? "Copied ✓" : copied === "failed" ? "Copy failed" : "Copy email"}
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-lg bg-bronze px-5 py-2.5 font-body text-[0.62rem] font-medium tracking-[0.2em] uppercase text-primary-foreground"
            >
              Open mail app
            </a>
          </div>
          </>
          )}
        </div>
      </Modal>
    </>
  );
}

/* ----------------------------------- rsvp ----------------------------------- */

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-ivory px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[var(--bronze)] focus:outline-none";

function Rsvp() {
  const allEvents = EVENT_DAYS.flatMap((day) => day.events);

  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<{
    waHref: string;
    recorded: boolean;
    accepted: boolean;
  } | null>(null);
  const [showPetals, setShowPetals] = useState(false);

  const allPicked = picked.length === allEvents.length;

  const toggle = (slug: string) => {
    setError(null);
    setPicked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const first = String(form.get("first") ?? "").trim();
    const last = String(form.get("last") ?? "").trim();

    if (!first || !last) return setError("Please add your name.");
    if (!attending) return setError("Please let us know whether you can make it.");
    if (attending === "yes" && picked.length === 0)
      return setError("Please choose which celebrations you'll be joining.");

    const from = String(form.get("from") ?? "").trim();
    if (attending === "yes" && !from) return setError("Please tell us where you'll be travelling from.");

    const guests = String(form.get("guests") ?? "1");
    const note = String(form.get("note") ?? "").trim();
    const coming = allEvents.filter((ev) => picked.includes(ev.slug)).map((ev) => ev.name);

    const text = [
      `RSVP — ${first} ${last}`,
      attending === "yes" ? "Joyfully accepts" : "Regretfully declines",
      attending === "yes" && `Guests: ${guests}`,
      attending === "yes" && `Travelling from: ${from}`,
      attending === "yes" && `Attending: ${coming.join(", ")}`,
      note && `Note: ${note}`,
    ]
      .filter(Boolean)
      .join("\n");

    const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

    // Record it before celebrating. If the sheet cannot be reached we say so
    // and fall back to WhatsApp, rather than thanking someone whose RSVP was
    // quietly dropped.
    setSending(true);
    setError(null);
    let recorded = false;
    try {
      const result = await submitRsvp({
        data: {
          firstName: first,
          lastName: last,
          attending,
          guests: Number(guests) || 1,
          travellingFrom: from,
          events: coming,
          note,
        },
      });
      recorded = result.ok;
    } catch {
      recorded = false;
    }
    setSending(false);

    const accepted = attending === "yes";
    setSubmitted({ waHref, recorded, accepted });
    // Petals are a celebration. Raining them on someone who just told us they
    // cannot come reads as tone-deaf.
    if (recorded && accepted) {
      setShowPetals(true);
      setTimeout(() => setShowPetals(false), 9000);
    }
  };

  return (
    // Extra room above, so the RSVP card stands well apart from Questions.
    <Section id="rsvp" className="mt-16">
      {showPetals && <Petals />}
      <div
        className="rounded-[24px] bg-pearl px-6 py-9 ring-1 ring-[var(--border)]"
        style={{ boxShadow: "var(--shadow-paper)" }}
      >
        <h2 className="text-center font-display text-4xl text-foreground">RSVP</h2>
        <Ornament className="mt-5 mb-8" />

        {submitted ? (
          <div className="flex flex-col items-center gap-6 text-center">
            {submitted.recorded ? (
              <>
                <p className="font-display text-xl text-foreground italic">
                  {submitted.accepted
                    ? "Thank you — we can't wait to celebrate with you."
                    : "Thank you for letting us know — you'll be missed."}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Your reply has reached {COUPLE.bride} &amp; {COUPLE.groom}. Nothing more to do.
                </p>
                {/* Now genuinely optional: the answer is already recorded. */}
                <a
                  href={submitted.waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-[0.66rem] font-medium tracking-[0.2em] uppercase text-bronze underline underline-offset-4"
                >
                  Add a note on WhatsApp
                </a>
              </>
            ) : (
              <>
                <p className="font-display text-xl text-foreground italic">
                  We couldn't save your RSVP just now.
                </p>
                <p className="mx-auto max-w-[19rem] font-body text-xs leading-relaxed text-muted-foreground">
                  Sorry — something went wrong at our end, not yours. Please send
                  it to us on WhatsApp instead; it's already written out for you.
                </p>
                <a
                  href={submitted.waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-bronze px-8 py-4 font-body text-[0.66rem] font-medium tracking-[0.24em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Send it on WhatsApp
                </a>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <input name="first" placeholder="First name" className={inputClass} />
              <input name="last" placeholder="Last name" className={inputClass} />
            </div>

            {/* Segmented attendance */}
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--border)]">
              {(
                [
                  ["yes", "Joyfully Accept"],
                  ["no", "Regretfully Decline"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAttending(value);
                    setError(null);
                  }}
                  aria-pressed={attending === value}
                  className="px-3 py-3.5 font-body text-[0.6rem] font-medium tracking-[0.16em] uppercase transition-colors"
                  style={{
                    background: attending === value ? "var(--bronze)" : "var(--ivory)",
                    color:
                      attending === value ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Which celebrations — only relevant to guests who are coming */}
            {attending === "yes" && (
              <fieldset className="mt-1 rounded-xl border border-[var(--border)] px-4 py-4">
                <legend className="px-1.5 font-body text-[0.58rem] font-medium tracking-[0.22em] uppercase text-bronze">
                  Which celebrations?
                </legend>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPicked(allPicked ? [] : allEvents.map((ev) => ev.slug));
                  }}
                  className="mt-1 font-body text-[0.68rem] text-muted-foreground underline decoration-[var(--gold)] underline-offset-4 transition-colors hover:text-bronze"
                >
                  {allPicked ? "Clear all" : "We're coming to everything"}
                </button>

                {EVENT_DAYS.map((day) => (
                  <div key={day.date} className="mt-4">
                    <p className="font-body text-[0.55rem] font-medium tracking-[0.2em] uppercase text-muted-foreground/70">
                      {day.date} · {day.weekday}
                    </p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {day.events.map((ev) => {
                        const checked = picked.includes(ev.slug);
                        return (
                          <label
                            key={ev.slug}
                            className="flex cursor-pointer items-center gap-3 rounded-lg bg-ivory px-3 py-2.5 ring-1 transition-colors"
                            style={{
                              borderColor: "transparent",
                              boxShadow: checked
                                ? "inset 0 0 0 1px var(--bronze)"
                                : "inset 0 0 0 1px var(--border)",
                            }}
                          >
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={checked}
                              onChange={() => toggle(ev.slug)}
                            />
                            <span
                              aria-hidden="true"
                              className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border border-[var(--border)] bg-background text-[11px] leading-none text-transparent transition-colors peer-checked:border-bronze peer-checked:bg-bronze peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-bronze/50"
                            >
                              ✓
                            </span>
                            <span className="min-w-0 flex-1 font-display text-[0.98rem] text-foreground">
                              {ev.name}
                            </span>
                            <span className="shrink-0 font-body text-[0.62rem] text-muted-foreground">
                              {ev.time}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </fieldset>
            )}

            {attending === "yes" && (
              <input
                name="from"
                placeholder="Travelling from (city)"
                autoComplete="address-level2"
                className={inputClass}
                onChange={() => setError(null)}
              />
            )}

            {attending === "yes" && (
              <select name="guests" defaultValue="1" className={inputClass} aria-label="Number of guests">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            )}

            <textarea
              name="note"
              rows={3}
              placeholder="A note for the couple (optional)"
              className={inputClass}
            />

            {error && (
              <p className="text-center font-body text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-2 rounded-full bg-bronze px-8 py-4 font-body text-[0.68rem] font-medium tracking-[0.28em] uppercase text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send RSVP"}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}

/* --------------------------------- microsite --------------------------------- */

export function Microsite({ live }: { live: boolean }) {
  return (
    <div className="relative">
      <BotanicalWatermark />
      <FloatingNav visible={live} />
      <MusicToggle />

      <main className="relative mx-auto w-full max-w-[26rem]">
        <Hero live={live} />

        <JoinUs />
        <EventsSection />
        <DetailCards />
        <Faqs />
        <Rsvp />

        {/* Closing */}
        <section className="px-5 pt-6 pb-16 text-center">
          <Reveal>
            <p className="mx-auto max-w-[16rem] font-script text-3xl leading-snug text-foreground/90">
              We can't wait to celebrate with you
            </p>
            <p className="mt-8 font-body text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">
              {COUPLE.bride} & {COUPLE.groom}
            </p>
          </Reveal>
        </section>

        {/* Designer credit, last thing on the page. Kept out of the closing
            block so it reads as a signature under the whole invitation rather
            than as part of the couple's sign-off. "Designed by" rather than
            "By": at the foot of a page the shorter form could mean written,
            hosted or organised. */}
        <footer className="flex items-center justify-center gap-3 px-5 pb-12">
          {/* Rules flank the line rather than sitting above it. They are flex
              items, so on a narrow phone they give way before the name wraps. */}
          <span
            aria-hidden="true"
            className="h-px w-8"
            style={{ background: "var(--gold)", opacity: 0.5 }}
          />
          {/* Only the name is the link, not the whole line — "Designed by" is
              not what a guest would tap. */}
          <p className="shrink-0 font-body text-[0.55rem] tracking-[0.24em] uppercase text-muted-foreground/60">
            Designed by{" "}
            <a
              href={DESIGNER_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={`${DESIGNER} on Instagram`}
              className="underline decoration-[color-mix(in_oklab,var(--gold)_60%,transparent)] underline-offset-4 transition-colors hover:text-muted-foreground"
            >
              {DESIGNER}
              {/* The same arrow the venue addresses use, so by the time a guest
                  reaches the foot of the page they have already learnt it means
                  this leads somewhere. Outside nothing, so it stays underlined
                  with the name rather than trailing loose. */}
              <span aria-hidden="true"> ↗</span>
            </a>
          </p>
          <span
            aria-hidden="true"
            className="h-px w-8"
            style={{ background: "var(--gold)", opacity: 0.5 }}
          />
        </footer>
      </main>
    </div>
  );
}
