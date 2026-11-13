/**
 * Ambient music for the invitation.
 *
 * The file lives in `public/` so a missing asset degrades to silence instead of
 * breaking the build. Playback only ever starts from the user's tap on the
 * envelope, which satisfies browser autoplay policies.
 *
 * The fade is the awkward part, and it is handled differently per platform for
 * a reason. iOS makes `HTMLMediaElement.volume` read-only — assignments are
 * silently ignored — so there the element is routed through a Web Audio gain
 * node instead. Everywhere else `volume` works, and Web Audio is deliberately
 * avoided: `createMediaElementSource` moves the element's output into the audio
 * context, so if that context is ever suspended the track plays to nobody. That
 * is exactly what silenced Android. Rather than guess at platforms, the code
 * asks the browser whether volume is settable and takes the simpler path when
 * it is.
 */
export const MUSIC_SRC = "/music/invitation.mp3";
/** Where in the file to begin, and begin again on each loop: 0:38. */
const LOCAL_START = 38;
const TARGET_VOLUME = 0.3;
const FADE_MS = 3500;

/**
 * The song now plays from the file above, straight from the site. To play it
 * through YouTube's embedded player instead, put a video id here (for example
 * "dPEPw-H12Ek") — it is slower to start, can show ads, and phones may refuse it.
 */
const YT_ID = "";
/** Where in the song to begin, and begin again on each loop: 0:38. */
const YT_START = 38;

/**
 * Diagnostics: add ?musicdebug=1 to the address and a small log of what the
 * song player is doing appears at the top of the screen. Nothing shows without it.
 */
let dbgEl: HTMLElement | null = null;
function dbg(msg: string) {
  if (typeof window === "undefined" || !/[?&]musicdebug\b/.test(window.location.search)) return;
  if (!dbgEl) {
    dbgEl = document.createElement("div");
    dbgEl.style.cssText =
      "position:fixed;left:0;right:0;top:0;z-index:100000;background:rgba(0,0,0,.85);color:#9f9;font:11px/1.35 monospace;padding:6px 8px;max-height:48vh;overflow:auto;pointer-events:none;white-space:pre-wrap";
    document.body.appendChild(dbgEl);
  }
  dbgEl.textContent += `${(performance.now() / 1000).toFixed(1)}s ${msg}\n`;
}

type YTPlayer = {
  getPlayerState?(): number;
  playVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
};
/** The player, parked off to the side at the size YouTube asks for. */
const HOST_OFF = "position:fixed;left:-320px;top:0;width:200px;height:200px;opacity:0;pointer-events:none;";
/**
 * The player laid invisibly over the whole screen. Phones only let audio start
 * when the finger lands on the player itself — a message sent to it from the
 * page does not count — so while the entry screen waits, the guest's tap goes
 * straight to the player, and the invitation opens as the song starts.
 */
const HOST_TAP = "position:fixed;inset:0;width:100%;height:100%;opacity:0;z-index:9999;";

let yt: YTPlayer | null = null;
let ytHost: HTMLElement | null = null;
let tapCb: (() => void) | null = null;
let tapFired = false;
let ytReady = false;
let ytWanted = false; // the guest has tapped
let ytPlaying = false;
let ytFaded = false;
let ytApi: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (ytApi) return ytApi;
  dbg(`start. ${navigator.userAgent.slice(0, 90)}`);
  dbg(`page: ${window.location.origin}  referrer-policy meta: ${document.querySelector('meta[name="referrer"]')?.getAttribute("content") ?? "(none)"}`);
  ytApi = new Promise((resolve) => {
    const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) {
      resolve();
      return;
    }
    dbg("loading the YouTube script...");
    window.setTimeout(() => {
      if (!w.YT?.Player) dbg("!! YouTube script still not loaded after 6s (blocked or offline?)");
    }, 6000);
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      dbg("YouTube script loaded");
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return ytApi;
}

/**
 * Loads the player ahead of the tap. Browsers only let audio start from a user
 * gesture, and a player that is still downloading when the guest taps would
 * miss it — so it is built early, paused, and merely told to play on the tap.
 */
export function preloadMusic() {
  if (typeof window === "undefined") return;
  if (!YT_ID) {
    // Download the file now, and park it at the start point, so the tap only
    // has to press play.
    prepareLocal();
    return;
  }
  if (yt) return;
  void loadYouTubeApi().then(() => {
    if (yt) return;
    const host = document.createElement("div");
    // Off to the side, not display:none.
    host.style.cssText = HOST_OFF;
    ytHost = host;
    const mount = document.createElement("div");
    host.appendChild(mount);
    document.body.appendChild(host);

    const YT = (window as unknown as { YT: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer } }).YT;
    yt = new YT.Player(mount, {
      host: "https://www.youtube-nocookie.com",
      // Fill the host, whichever size it is wearing.
      width: "100%",
      height: "100%",
      videoId: YT_ID,
      // No loop/playlist here: YouTube's own loop restarts at 0:00 and ignores
      // `start`, so the loop is done below when the song ends.
      playerVars: { autoplay: 0, controls: 0, start: YT_START, playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          dbg("player ready");
          ytReady = true;
          // Silent until the fade: a tap on the player starts it at full volume.
          yt?.setVolume(0);
          if (muted) yt?.mute();
          if (ytWanted) playYouTube();
          if (tapCb && !tapFired) enterTapMode();
        },
        // The video cannot be played here (removed, or embedding switched off):
        // open the invitation without music rather than leave the guest stuck.
        onError: (e: { data: number }) => {
          dbg(`!! PLAYER ERROR code ${e.data} (2 bad id, 5 html5, 100 not found, 101/150 embedding off, 153 referrer)`);
          fireTap();
        },
        onStateChange: (e: { data: number }) => {
          dbg(`state ${e.data} (-1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued)`);
          // Buffering or playing means the tap on the player took.
          if (e.data === 1 || e.data === 3) fireTap();
          // Ended: go round again from the start point, not from the top.
          if (e.data === 0) {
            yt?.seekTo(YT_START, true);
            yt?.playVideo();
          }
          const playing = e.data === 1;
          if (playing !== ytPlaying) {
            ytPlaying = playing;
            emit();
          }
          if (playing && !ytFaded) fadeYouTube();
        },
      },
    });
  });
}

function playYouTube() {
  if (!yt) return;
  dbg("sending playVideo()");
  yt.setVolume(0);
  if (muted) yt.mute();
  yt.playVideo();
}

/** The same slow fade-in as the local track, in YouTube's 0–100 volume. */
function fadeYouTube() {
  ytFaded = true;
  const started = performance.now();
  const id = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - started) / FADE_MS);
    yt?.setVolume(Math.round(TARGET_VOLUME * 100 * t));
    if (t >= 1) window.clearInterval(id);
  }, 100);
}

function startYouTube() {
  ytWanted = true;
  if (yt && ytReady) playYouTube();
  else preloadMusic();
}

/** Tapping into the player takes focus from the page; treat that as the tap. */
function onWindowBlur() {
  dbg("window blur: the touch reached the player");
  // If the player does not report playing (an ad, a slow start), open anyway.
  if (tapCb && !tapFired) window.setTimeout(fireTap, 1600);
}

function enterTapMode() {
  if (!ytHost) return;
  ytHost.style.cssText = HOST_TAP;
  dbg("tap layer ON: the player now covers the screen");
  window.addEventListener("blur", onWindowBlur);
}

function fireTap() {
  if (tapFired || !tapCb) return;
  tapFired = true;
  dbg("opening the invitation");
  // Report what the player says a few seconds after the tap.
  window.setTimeout(() => dbg(`6s after tap: player state = ${yt?.getPlayerState?.() ?? "unknown"}`), 6000);
  releaseMusicTap();
  tapCb();
}

/**
 * Lets the entry screen hand its first tap to the player. `onTap` is called
 * once the guest has tapped, with or without sound, to open the invitation.
 * Until the player is ready the ordinary tap on the screen still works.
 */
export function armMusicTap(onTap: () => void) {
  if (!YT_ID || typeof window === "undefined") return;
  tapCb = onTap;
  tapFired = false;
  if (yt && ytReady) enterTapMode();
}

/** Puts the player back out of the way, so later taps reach the page. */
export function releaseMusicTap() {
  if (ytHost) ytHost.style.cssText = HOST_OFF;
  window.removeEventListener("blur", onWindowBlur);
}

let audio: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeMusic(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export function getMusicState() {
  return { playing: audio !== null || ytPlaying, muted };
}

/** True when the browser honours volume assignments — false on iOS. */
function volumeIsSettable(el: HTMLAudioElement) {
  el.volume = 0.5;
  const ok = Math.abs(el.volume - 0.5) < 0.01;
  el.volume = 0;
  return ok;
}

/**
 * Routes the element through a gain node, for platforms that ignore `volume`.
 *
 * Only ever connects a context that is already running. Routing an element into
 * a suspended context is a one-way door: its output moves into the graph, and
 * if that graph never starts, the track plays to nobody with no way back. Music
 * that cannot fade is a small loss; music nobody can hear is not.
 */
function buildGraph(el: HTMLAudioElement): GainNode | null {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    const context = new Ctor();
    void context.resume();
    if (context.state !== "running") {
      void context.close();
      return null;
    }

    ctx = context;
    const source = context.createMediaElementSource(el);
    const node = context.createGain();
    node.gain.value = 0;
    source.connect(node);
    node.connect(context.destination);
    return node;
  } catch {
    ctx = null;
    return null;
  }
}

let localEl: HTMLAudioElement | null = null;

/** The song file, loading and waiting at the start point. Made once. */
function prepareLocal(): HTMLAudioElement {
  if (localEl) return localEl;
  const el = new Audio(MUSIC_SRC);
  el.preload = "auto";
  el.muted = muted;
  const seek = () => {
    try {
      el.currentTime = LOCAL_START;
    } catch {
      /* not seekable yet; tried again when it has loaded */
    }
  };
  el.addEventListener("loadedmetadata", seek, { once: true });
  // Round again from the start point, not from the top of the file.
  el.addEventListener("ended", () => {
    seek();
    void el.play();
  });
  localEl = el;
  dbg(`local file: loading ${MUSIC_SRC}`);
  return el;
}

/** Starts the invitation's track. Called from the tap that opens it. */
export async function startMusic() {
  if (typeof window === "undefined") return;
  if (YT_ID) {
    startYouTube();
    return;
  }
  if (audio) return;

  const el = prepareLocal();
  el.muted = muted;

  // A missing or unreachable file must not surface as an unhandled rejection.
  el.addEventListener(
    "error",
    () => {
      if (audio === el) {
        audio = null;
        emit();
      }
    },
    { once: true },
  );

  const canSetVolume = volumeIsSettable(el);
  const node = canSetVolume ? null : buildGraph(el);
  // No fade available: start audible rather than at zero, or a platform that
  // ignores volume and has no graph would stay silent forever.
  if (!canSetVolume && !node) el.volume = TARGET_VOLUME;

  try {
    await el.play();
  } catch (err) {
    dbg(`!! play() refused: ${String(err)}`);
    emit();
    return;
  }
  // Tapped before the file had loaded enough to seek: go to the start point now.
  if (el.currentTime < LOCAL_START - 1) {
    try {
      el.currentTime = LOCAL_START;
    } catch {
      /* the loadedmetadata handler will do it */
    }
  }

  audio = el;
  gain = node;
  emit();
  dbg("local file: playing");
  window.setTimeout(() => dbg(`3s later: t=${el.currentTime.toFixed(1)}s paused=${el.paused} muted=${el.muted}`), 3000);

  const started = performance.now();
  const step = (now: number) => {
    if (audio !== el) return;
    const t = Math.min(1, (now - started) / FADE_MS);
    const level = TARGET_VOLUME * t;
    if (node) node.gain.value = level;
    else el.volume = level;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Mutes and unmutes.
 *
 * Goes through `.muted`, which every platform honours — dropping the volume to
 * zero does nothing on iOS.
 */
export function toggleMute() {
  if (YT_ID) {
    if (!yt) return;
    muted = !muted;
    if (muted) yt.mute();
    else yt.unMute();
    emit();
    return;
  }
  if (!audio) return;
  muted = !muted;
  audio.muted = muted;
  if (gain) gain.gain.value = muted ? 0 : TARGET_VOLUME;
  else audio.volume = muted ? 0 : TARGET_VOLUME;
  emit();
}
