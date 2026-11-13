
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

export const WHATSAPP_NUMBER = "18326686089";

/**
 * Where the invitation lives. Share previews need absolute URLs — a crawler
 * has no page context to resolve a relative path against, which is why no
 * photograph was appearing.
 */
export const SITE_URL = "https://thelavstory.com";

/** Left empty until there is one — the contact pop-up hides the email part. */
export const CONTACT_EMAIL = "";

/** Credited in the closing line. */
export const DESIGNER = "Sanjana Veesam";
export const DESIGNER_URL = "https://www.instagram.com/sanjanaa_vv/";

/**
 * Who to call. `tel` is the number that rings; `whatsapp` is only set when the
 * account lives on a different number, as Avyay's does — sending Chat to the
 * calling number would reach nobody.
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
 * Shared Drive folders guests add their own photos to. Haldi and Mehendi share
 * one, as supplied by the couple.
 *
 * Each folder must be shared so that anyone with the link can *contribute*, not
 * just view — otherwise the button leads guests to a wall.
 */
export const GALLERY_FOLDERS: { label: string; url: string }[] = [
  {
    label: "Haldi & Mehendi",
    url: "https://drive.google.com/drive/folders/1Rb5ErOBBV1mQTkxFFEB5_CsrUfCBRxMI?usp=drive_link",
  },
  {
    label: "Pellikuthuru",
    url: "https://drive.google.com/drive/folders/1smOuRVF_4XYjHh0zeiK7V9qyUKITsvlJ?usp=drive_link",
  },
  {
    label: "Pellikoduku",
    url: "https://drive.google.com/drive/folders/1XkwXCSAN68BDPdSGGNjUnxXIWKdX1ue4?usp=drive_link",
  },
  {
    label: "Sangeet & Cocktail Night",
    url: "https://drive.google.com/drive/folders/120l9T4qSeIYm4RiQ7KfWzW3qdNidNsPr?usp=sharing",
  },
  {
    // TODO(photos): supplied without a label — assumed to be the wedding, being
    // the only celebration left. Confirm before the invitations go out.
    label: "Wedding Ceremony",
    url: "https://drive.google.com/drive/folders/1LRC3mlJclf4CjmCsnI8_ddAj9hBAZj36?usp=drive_link",
  },
];

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
  dressCode?: DressCode;
  /** Shared folder for this celebration's photos. */
  photosUrl?: string;
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

/**
 * Hotels near the celebrations. Found by name rather than by a stored URL:
 * a Maps search resolves to the place page — address, photos, reviews and
 * booking links — and cannot rot the way a copied URL can.
 *
 * A booking link is the one exception, and it is stored because it has to be:
 * it is not a place, it is our group's rate, and nothing but that exact URL
 * will find it.
 */
export type Hotel = {
  /** The full name, which is what finds the right place on the map. */
  name: string;
  /**
   * What the row shows. Every one of these hotels is in Huntersville, minutes
   * from Lake Norman, so each full name ends in some arrangement of those two
   * words — repeated down a list they stop telling a guest anything and only
   * wrap each row onto a second line. The copy says where they are once.
   */
  label: string;
  /**
   * Where we hold a rate, the row books instead of pointing at a map — the
   * discount only applies through this link, so sending a guest to the hotel's
   * own site would quietly cost them money.
   */
  booking?: { url: string; deadline: Date };
};

// The hotel holding our rate leads, so the discount is the first thing read
// rather than something found four rows down.
export const HOTELS: Hotel[] = [
  {
    name: "Courtyard by Marriott Charlotte Lake Norman",
    label: "Courtyard by Marriott",
    booking: {
      url: "https://app.marriott.com/resview2?id=1788463710453&key=GRP&app=resvlink",
      deadline: IST(9, 14, 23, 59),
    },
  },
  { name: "Four Points by Sheraton Charlotte - Lake Norman", label: "Four Points by Sheraton" },
  { name: "Comfort Suites Huntersville near Lake Norman", label: "Comfort Suites" },
  { name: "Best Western Plus Huntersville Inn", label: "Best Western Plus" },
  {
    name: "SpringHill Suites by Marriott Charlotte Huntersville",
    label: "SpringHill Suites by Marriott",
  },
];

/**
 * The booking deadline in words, so the copy and the row cannot disagree.
 *
 * Formatted in Eastern time rather than the reader's: a guest booking from
 * India should see the date the hotel means, not the one their own midnight
 * happens to fall on.
 */
export const bookByLabel = (deadline: Date): string =>
  deadline.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });

export const hotelHref = (name: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

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

export type DetailIcon = "bed" | "plane" | "camera" | "pin";

// TODO(content): shuttle timings still need to be filled in by the couple —
// the copy below says so plainly rather than promising details that may not
// arrive.
export const DETAIL_CARDS: {
  title: string;
  icon: DetailIcon;
  body: string;
  /** Appends the full venue list, with directions, under the copy. */
  venues?: boolean;
  /** Appends the shared photo folders under the copy. */
  gallery?: boolean;
  /** Appends the nearby hotels under the copy. */
  hotels?: boolean;
}[] = [
  {
    title: "Travel",
    icon: "plane",
    body: "Charlotte Douglas International (CLT) is the closest airport and the easiest arrival for almost everyone. It's a major hub, so most guests will find a direct flight.\n\nFrom the airport it's roughly half an hour to the venues, traffic depending. Rental cars, Uber and Lyft are all easy to find at CLT, and we'd suggest a car — the venues are a little spread out and not walkable from one another.",
  },
  {
    title: "Venues",
    icon: "pin",
    body: "Where each celebration is held. Tap any address for directions.",
    venues: true,
  },
];
