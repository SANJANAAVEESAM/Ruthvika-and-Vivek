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
export const MUSIC_SRC = "/music/invitation.m4a";
const TARGET_VOLUME = 0.3;
const FADE_MS = 3500;

/**
 * The song, played through YouTube's own embedded player. Set YT_ID to "" to
 * fall back to the local file above.
 */
const YT_ID = "dPEPw-H12Ek";
/** Where in the song to begin, and begin again on each loop: 0:38. */
const YT_START = 38;

type YTPlayer = {
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
  ytApi = new Promise((resolve) => {
    const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) {
      resolve();
      return;
    }
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
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
  if (!YT_ID || typeof window === "undefined" || yt) return;
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
          ytReady = true;
          // Silent until the fade: a tap on the player starts it at full volume.
          yt?.setVolume(0);
          if (muted) yt?.mute();
          if (ytWanted) playYouTube();
          if (tapCb && !tapFired) enterTapMode();
        },
        // The video cannot be played here (removed, or embedding switched off):
        // open the invitation without music rather than leave the guest stuck.
        onError: () => fireTap(),
        onStateChange: (e: { data: number }) => {
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
  // If the player does not report playing (an ad, a slow start), open anyway.
  if (tapCb && !tapFired) window.setTimeout(fireTap, 1600);
}

function enterTapMode() {
  if (!ytHost) return;
  ytHost.style.cssText = HOST_TAP;
  window.addEventListener("blur", onWindowBlur);
}

function fireTap() {
  if (tapFired || !tapCb) return;
  tapFired = true;
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

/** Starts the invitation's track. Called from the tap that opens it. */
export async function startMusic() {
  if (typeof window === "undefined") return;
  if (YT_ID) {
    startYouTube();
    return;
  }
  if (audio) return;

  const el = new Audio(MUSIC_SRC);
  el.loop = true;
  el.preload = "auto";
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
  } catch {
    emit();
    return;
  }

  audio = el;
  gain = node;
  emit();

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
