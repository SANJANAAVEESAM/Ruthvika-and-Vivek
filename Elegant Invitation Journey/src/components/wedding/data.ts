
export const COUPLE = { bride: "Ruthvika", groom: "Vivek" };

export const WEDDING_YEAR = 2026;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A wall-clock India Standard Time, as an instant. IST is UTC+5:30 all year
 * (no daylight saving). Month is zero-based, matching Date.
 */
const IST = (month: number, day: number, hour: number, minute: number) =>
  new Date(`${WEDDING_YEAR}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+05:30`);

/** Marriage — Thursday 26 November, 9:15 AM IST. */
export const WEDDING_DATE = IST(10, 26, 9, 15);

export const WEDDING_DATE_RANGE = `November 22–26, ${WEDDING_YEAR}`;

/** Sunny — where the RSVP's WhatsApp backup goes if saving ever fails. */
export const WHATSAPP_NUMBER = "917036884774";

/**
 * Where the invitation lives. Share previews need absolute URLs — a crawler
 * has no page context to resolve a relative path against.
 *
 * TODO(domain): set this to the live address (for example
 * "https://ruthvikaandvivek.com") once the site is published, or the link
 * preview image will not show when the link is shared.
 */
export const SITE_URL = "";

/** Left empty until there is one — the contact pop-up hides the email part. */
export const CONTACT_EMAIL = "";

/** Credited in the closing line. */
export const DESIGNER = "Sanjana Veesam";
export const DESIGNER_URL = "https://www.instagram.com/sanjanaa_vv/";

/**
 * Who to call. `tel` is the number that rings; `whatsapp` is only set when the
 * WhatsApp account lives on a different number — sending Chat to the calling
 * number would reach nobody.
 */
export const CONTACTS: {
  name: string;
  tel: string;
  display: string;
  whatsapp?: string;
}[] = [
  { name: "SadaShivudu", tel: "+919440601086", display: "+91 94406 01086" },
  { name: "Sunny", tel: "+917036884774", display: "+91 70368 84774" },
];

import type { EventTheme } from "./eventThemes";

/**
 * A dress code the sheet can draw rather than merely state.
 *
 * `kind` selects the swatch row: a spread of hues for "solids", metallics for
 * "bling". Only the three events that actually have a code carry one.
 */
export type DressCode = {
  label: string;
  /** A single paragraph. Use `lines` instead when the guidance differs by guest. */
  note?: string;
  /** Guidance split by who it applies to, e.g. Men / Women. */
  lines?: { who: string; what: string }[];
  /** Optional inspiration thumbnails, shown in a row beneath the wording. */
  images?: string[];
};

export type Venue = {
  name: string;
  /** Street or area line shown under the venue name. */
  address?: string;
  /** A full Google Maps share link. Wins over mapsQuery when present. */
  mapsUrl?: string;
  /** Fallback: a search string. Directions stay hidden until one is set. */
  mapsQuery?: string;
};

export type WeddingEvent = {
  slug: string;
  name: string;
  theme?: string;
  /** Drives the accent and motif on the event's full-page details. */
  themeKey: EventTheme;
  time: string;
  /** Small caps label above the time, e.g. "Sumuhurtham". */
  timeLabel?: string;
  /** A short line after the venue, e.g. "Lunch to follow". */
  note?: string;
  /** The event's name in Telugu, shown under the English one in its details. */
  teluguName?: string;
  /** A few lines about the celebration, in English and in Telugu. */
  about?: string;
  aboutTe?: string;
  /** What to wear, e.g. "Shades of yellow and festive brights". */
  attire?: string;
  /** A fuller title for the details pop-up, when the schedule's name is short. */
  fullName?: string;
  /** The key moments of the ceremony, listed in its details. */
  rituals?: { name: string; detail?: string }[];
  /** Live-stream link for guests watching from afar. TODO(live): add per event. */
  liveUrl?: string;
  dressCode?: DressCode;
  /** Held at the same place as the event above it, so they list as one. */
  sharesVenueWithPrevious?: boolean;
  /**
   * The formal invitation, shown above the details. Structured rather than one
   * run-on sentence so each family can be set on its own lines, the way an
   * invitation card would.
   */
  invitation?: {
    lead: string;
    parties: { name: string; parents?: string }[];
  };
  /** TODO(content): Mehendi's dress code is an inspiration photo, not text —
   *  drop the image in src/assets and point this at it. */
  dressCodeImage?: string;
  /** Renders a "Followed by" link to the event above it. */
  followsPrevious?: boolean;
  venue: Venue;
  start: Date;
  end: Date;
};

export type EventDay = {
  date: string;
  weekday: string;
  events: WeddingEvent[];
};

/**
 * Venues that host more than one celebration, named once and shared.
 *
 * Written out here rather than repeated inside each event so the address and
 * the map link cannot drift apart between two celebrations at the same place.
 *
 * The map links carry both the address and Google's own place id (`ftid`),
 * which is what makes them land on the venue's page rather than on a search
 * that could resolve somewhere else. The tracking parameters that came with
 * the shared links are dropped — they are tied to the session that produced
 * them and mean nothing to a guest.
 */
const MOONA: Venue = {
  name: "Moona Resort",
  address: "Unikicherla",
  mapsQuery: "Moona Resort, Unikicherla",
};

export const EVENT_DAYS: EventDay[] = [
  {
    date: "22 November",
    weekday: "Sunday",
    events: [
      {
        slug: "haldi",
        name: "Haldi",
        themeKey: "carnival",
        time: "11:00 AM",
        note: "Lunch to follow",
        teluguName: "పసుపు వేడుక",
        about:
          "The celebrations open with the Haldi at 11:00 AM IST — turmeric, blessings and laughter as family and friends anoint the couple and wish them well for the days ahead. Lunch follows at the resort.",
        aboutTe:
          "వేడుకలు పసుపు వేడుకతో మొదలవుతాయి — కుటుంబ సభ్యులు, స్నేహితులు వధూవరులకు పసుపు రాసి ఆశీర్వదిస్తారు. తర్వాత అందరూ కలిసి మధ్యాహ్న భోజనం చేస్తారు.",
        attire: "Shades of yellow and festive brights",
        venue: MOONA,
        start: IST(10, 22, 11, 0),
        end: IST(10, 22, 15, 0),
      },
      {
        slug: "sangeeth",
        name: "Sangeeth",
        themeKey: "masquerade",
        time: "7:00 PM",
        note: "Dinner to follow",
        teluguName: "సంగీత సంబరం",
        about:
          "The same day closes with the Sangeeth in the evening — music, dance and family performances at the resort. Bring a song, a dance, or at the very least, enthusiastic applause. Dinner follows.",
        aboutTe:
          "అదే రోజు సాయంత్రం సంగీత సంబరం — పాటలు, నృత్యాలు, కుటుంబ ప్రదర్శనలతో సందడిగా సాగుతుంది. మీరూ ఒక పాటో, నృత్యమో సిద్ధం చేసుకుని రండి! తర్వాత విందు భోజనం ఉంటుంది.",
        attire: "Bright colours and Indo-western wear, comfortable for dancing",
        sharesVenueWithPrevious: true,
        venue: MOONA,
        start: IST(10, 22, 19, 0),
        end: IST(10, 22, 23, 0),
      },
    ],
  },
  {
    date: "23 November",
    weekday: "Monday",
    events: [
      {
        slug: "pellikuthuru",
        name: "Pelli Kuthuru",
        themeKey: "pellikuthuru",
        time: "11:00 AM",
        teluguName: "పెళ్ళికూతురు",
        about:
          "The bride is made Pelli Kuthuru at home — anointed and blessed by family in the warmth of the residence, surrounded by songs, turmeric and jasmine, as the wedding morning draws near.",
        aboutTe:
          "ఇంట్లోనే వధువును పెళ్ళికూతురుగా తీర్చిదిద్దే వేడుక — పసుపు, మల్లెపూలు, పాటల నడుమ కుటుంబ సభ్యుల ఆశీస్సులతో జరుగుతుంది.",
        attire: "Festive traditional wear in bright colours",
        // A home rather than a hall — no address or map to show.
        venue: { name: "At our residence" },
        start: IST(10, 23, 11, 0),
        end: IST(10, 23, 14, 0),
      },
    ],
  },
  {
    date: "26 November",
    weekday: "Thursday",
    events: [
      {
        slug: "wedding",
        name: "Marriage",
        themeKey: "telugu",
        time: "9:15 AM",
        timeLabel: "Sumuhurtham",
        fullName: "Pelli / Muhurtham — The Wedding",
        teluguName: "వివాహ మహోత్సవం",
        about:
          "The main ceremony, at the temple of Goddess Jogulamba — one of the Shakti Peethas — on the banks of the Tungabhadra. Please plan to arrive well before 9:15 AM: the Muhurtham waits for no one.",
        aboutTe:
          "శక్తిపీఠమైన జోగులాంబ అమ్మవారి సన్నిధిలో, తుంగభద్ర నదీ తీరంలో జరిగే ప్రధాన వివాహ వేడుక. ముహూర్తం ఉదయం 9:15 — దయచేసి ముందుగానే చేరుకోండి.",
        rituals: [
          { name: "Jeelakarra Bellam", detail: "at the exact Muhurtham" },
          { name: "Kanyadaanam", detail: "the giving away of the bride" },
          { name: "Mangalsutram & Mettelu", detail: "the sacred thread and toe rings" },
          { name: "Talambralu", detail: "the showering of turmeric rice" },
        ],
        attire:
          "Kanjeevaram silk sarees, kurta–dhotis and other traditional wear. Modest, temple-appropriate dress; footwear is removed at the temple.",
        invitation: {
          lead: "With the blessings of our families, we joyfully invite you to the wedding of",
          parties: [{ name: "Ruthvika" }, { name: "Vivek" }],
        },
        venue: {
          name: "Jogulamba Ammavari Temple",
          address: "Alampur, Gadwal, Telangana",
          mapsQuery: "Jogulamba Temple, Alampur",
        },
        start: IST(10, 26, 9, 15),
        end: IST(10, 26, 13, 0),
      },
    ],
  },
];

/** Directions link, or null while the venue is still unconfirmed. */
export function venueMapsHref(venue: Venue): string | null {
  if (venue.mapsUrl) return venue.mapsUrl;
  if (venue.mapsQuery)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery)}`;
  return null;
}

export const EVENTS: WeddingEvent[] = EVENT_DAYS.flatMap((day) => day.events);


export const FULL_WEDDING_CAL = {
  title: `${COUPLE.bride} & ${COUPLE.groom} — Wedding Celebrations`,
  description: `Celebrations for the wedding of ${COUPLE.bride} & ${COUPLE.groom}. Marriage on 26 November at 9:15 AM IST, Jogulamba Ammavari Temple, Alampur.`,
  location: "Telangana, India",
  startUtc: IST(10, 22, 11, 0).toISOString(),
  endUtc: IST(10, 26, 13, 0).toISOString(),
};

export type DetailIcon = "bed" | "plane" | "camera" | "pin" | "live";

export const DETAIL_CARDS: {
  title: string;
  icon: DetailIcon;
  body: string;
  /** Appends the full venue list, with directions, under the copy. */
  venues?: boolean;
  /** Appends each event's live-stream link under the copy. */
  live?: boolean;
}[] = [
  {
    title: "Venues",
    icon: "pin",
    body: "Where each celebration is held. Tap any address for directions.",
    venues: true,
  },
  {
    title: "Live Links",
    icon: "live",
    body: "Can't be with us in person? Watch each celebration live, wherever you are.",
    live: true,
  },
];
