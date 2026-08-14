import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { TypewriterPortfolio } from "./TypewriterPortfolio";
import "./ClassicDesk.css";

const CassettePlayer = lazy(() =>
  import("./CassettePlayer").then((module) => ({ default: module.CassettePlayer })),
);
const BlackjackTable = lazy(() =>
  import("./BlackjackTable").then((module) => ({ default: module.BlackjackTable })),
);

export type DeskMode = "typewriter" | "cassette" | "blackjack";
type SwapPhase = "idle" | "packing" | "unpacking";

const musicLibrary = [
  {
    title: "Victory (Instrumental)",
    artist: "Lakshya",
    src: "/audio/music/victory-instrumental.m4a",
    shell: "#853b36",
    label: "#d8c6a6",
    accent: "#58201d",
  },
  {
    title: "Purple Rain",
    artist: "Prince",
    src: "/audio/music/purple-rain.m4a",
    shell: "#655071",
    label: "#d1c2d0",
    accent: "#402a52",
  },
  {
    title: "Shivam",
    artist: "Baahubali 2",
    src: "/audio/music/shivam.m4a",
    shell: "#a45a36",
    label: "#ddc69e",
    accent: "#6d2d1d",
  },
  {
    title: "Yellow (Acoustic)",
    artist: "Coldplay",
    src: "/audio/music/yellow.m4a",
    shell: "#b28d32",
    label: "#ded3a6",
    accent: "#705916",
  },
] as const;

function createBoxNoise(context: AudioContext, duration: number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

function playBoxSound(context: AudioContext, direction: "pack" | "unpack") {
  const now = context.currentTime;
  const duration = direction === "pack" ? 0.56 : 0.48;
  const scrape = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const scrapeGain = context.createGain();
  scrape.buffer = createBoxNoise(context, duration);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(direction === "pack" ? 1450 : 520, now);
  filter.frequency.exponentialRampToValueAtTime(direction === "pack" ? 360 : 1700, now + duration);
  scrapeGain.gain.setValueAtTime(0.001, now);
  scrapeGain.gain.linearRampToValueAtTime(0.075, now + 0.05);
  scrapeGain.gain.setValueAtTime(0.045, now + duration - 0.1);
  scrapeGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  scrape.connect(filter).connect(scrapeGain).connect(context.destination);
  scrape.start(now);
  scrape.stop(now + duration);

  const thumpAt = now + (direction === "pack" ? 0.42 : 0.06);
  const thump = context.createOscillator();
  const thumpGain = context.createGain();
  thump.type = "triangle";
  thump.frequency.setValueAtTime(direction === "pack" ? 92 : 118, thumpAt);
  thump.frequency.exponentialRampToValueAtTime(48, thumpAt + 0.13);
  thumpGain.gain.setValueAtTime(0.085, thumpAt);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, thumpAt + 0.15);
  thump.connect(thumpGain).connect(context.destination);
  thump.start(thumpAt);
  thump.stop(thumpAt + 0.16);
}

export function ClassicDesk() {
  const [mode, setMode] = useState<DeskMode>("typewriter");
  const [swapPhase, setSwapPhase] = useState<SwapPhase>("idle");
  const [typewriterUnlocked, setTypewriterUnlocked] = useState(false);
  const swapTimer = useRef<number>();
  const finishTimer = useRef<number>();
  const boxAudioRef = useRef<AudioContext>();

  const getBoxAudio = () => {
    if (!boxAudioRef.current) boxAudioRef.current = new AudioContext();
    if (boxAudioRef.current.state === "suspended") void boxAudioRef.current.resume();
    return boxAudioRef.current;
  };

  const selectObject = (nextMode: DeskMode) => {
    if (nextMode === mode && swapPhase === "idle") return;

    window.clearTimeout(swapTimer.current);
    window.clearTimeout(finishTimer.current);
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((media) => {
      media.pause();
      media.muted = true;
      media.currentTime = 0;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSwapPhase("packing");
    const boxAudio = getBoxAudio();
    playBoxSound(boxAudio, "pack");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    swapTimer.current = window.setTimeout(
      () => {
        setMode(nextMode);
        setSwapPhase("unpacking");
        if (boxAudio.state !== "closed") playBoxSound(boxAudio, "unpack");
      },
      reducedMotion ? 60 : 620,
    );
    finishTimer.current = window.setTimeout(
      () => setSwapPhase("idle"),
      reducedMotion ? 130 : 1280,
    );
  };

  useEffect(
    () => () => {
      window.clearTimeout(swapTimer.current);
      window.clearTimeout(finishTimer.current);
      if (boxAudioRef.current) void boxAudioRef.current.close();
    },
    [],
  );

  return (
    <div className={`classic-desk classic-desk--${swapPhase}`}>
      <div className="classic-desk__grain" aria-hidden="true" />

      <div className={`classic-desk__scene classic-desk__scene--${swapPhase}`} key={mode}>
        <Suspense fallback={<span className="classic-desk__loading">UNPACKING…</span>}>
          {mode === "typewriter" ? (
            <TypewriterPortfolio
              isUnlocked={typewriterUnlocked}
              onUnlock={() => setTypewriterUnlocked(true)}
              onNavigate={selectObject}
            />
          ) : null}
          {mode === "cassette" ? (
            <CassettePlayer tracks={musicLibrary} onNavigate={selectObject} />
          ) : null}
          {mode === "blackjack" ? <BlackjackTable onNavigate={selectObject} /> : null}
        </Suspense>
      </div>

      {swapPhase !== "idle" ? (
        <div className="object-box-transition" aria-hidden="true">
          <div className="object-box object-box--rear">
            <div className="object-box__back-flap" />
            <div className="object-box__inside" />
          </div>
          <div className="object-box object-box--front">
            <div className="object-box__left-flap" />
            <div className="object-box__right-flap" />
            <div className="object-box__front-flap" />
            <div className="object-box__front">
              <span>SIDDHANT</span>
              <strong>PERSONAL ARTIFACT</strong>
              <small>HANDLE WITH CURIOSITY</small>
            </div>
          </div>
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {swapPhase === "idle" ? `${mode} selected` : `Changing desk object`}
      </span>
    </div>
  );
}
