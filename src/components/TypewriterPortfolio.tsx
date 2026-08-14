import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowUpRight, Download, Layers3, Mail, MapPin, Music2, X } from "lucide-react";
import type { DeskMode } from "./ClassicDesk";
import { ChromeSiddhantLogo } from "./ChromeSiddhantLogo";
import "./TypewriterPortfolio.css";

type PrintState = "idle" | "printing" | "printed" | "tearing" | "resetting";
type CutterDrag = {
  pointerId: number;
  startX: number;
  maxTravel: number;
  triggered: boolean;
};
const TYPEWRITER_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;
const TYPEWRITER_KEYS = TYPEWRITER_ROWS.join("").split("");
const MAX_DRAFT_LENGTH = 140;

function createNoiseBuffer(context: AudioContext, duration: number) {
  const frameCount = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function playPrintSound(context: AudioContext) {
  const now = context.currentTime;
  const duration = 3.2;
  const master = context.createGain();
  master.gain.setValueAtTime(0.13, now);
  master.connect(context.destination);

  const roller = context.createBufferSource();
  roller.buffer = createNoiseBuffer(context, duration);
  const rollerFilter = context.createBiquadFilter();
  rollerFilter.type = "bandpass";
  rollerFilter.frequency.setValueAtTime(920, now);
  rollerFilter.Q.setValueAtTime(0.55, now);
  const rollerGain = context.createGain();
  rollerGain.gain.setValueAtTime(0.001, now);
  rollerGain.gain.linearRampToValueAtTime(0.055, now + 0.08);
  rollerGain.gain.setValueAtTime(0.04, now + duration - 0.2);
  rollerGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  roller.connect(rollerFilter).connect(rollerGain).connect(master);
  roller.start(now);
  roller.stop(now + duration);

  for (let pulse = 0; pulse < 25; pulse += 1) {
    const at = now + 0.12 + pulse * 0.118 + (pulse % 3) * 0.009;
    const click = context.createBufferSource();
    click.buffer = createNoiseBuffer(context, 0.038);
    const clickFilter = context.createBiquadFilter();
    clickFilter.type = "bandpass";
    clickFilter.frequency.setValueAtTime(pulse % 4 === 0 ? 2450 : 1850, at);
    clickFilter.Q.setValueAtTime(1.5, at);
    const clickGain = context.createGain();
    clickGain.gain.setValueAtTime(0.001, at);
    clickGain.gain.linearRampToValueAtTime(pulse % 5 === 0 ? 0.26 : 0.17, at + 0.004);
    clickGain.gain.exponentialRampToValueAtTime(0.001, at + 0.034);
    click.connect(clickFilter).connect(clickGain).connect(master);
    click.start(at);
    click.stop(at + 0.038);
  }

  const bell = context.createOscillator();
  const bellGain = context.createGain();
  const bellAt = now + duration - 0.2;
  bell.type = "sine";
  bell.frequency.setValueAtTime(1480, bellAt);
  bell.frequency.exponentialRampToValueAtTime(1370, bellAt + 0.22);
  bellGain.gain.setValueAtTime(0.001, bellAt);
  bellGain.gain.linearRampToValueAtTime(0.13, bellAt + 0.008);
  bellGain.gain.exponentialRampToValueAtTime(0.001, bellAt + 0.26);
  bell.connect(bellGain).connect(master);
  bell.start(bellAt);
  bell.stop(bellAt + 0.27);
}

function playTearSound(context: AudioContext) {
  const now = context.currentTime;
  const duration = 0.68;
  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(context, duration);

  const bodyFilter = context.createBiquadFilter();
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(1750, now);
  bodyFilter.frequency.linearRampToValueAtTime(1100, now + duration);

  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.001, now);
  bodyGain.gain.linearRampToValueAtTime(0.11, now + 0.045);
  bodyGain.gain.setValueAtTime(0.075, now + 0.2);
  bodyGain.gain.linearRampToValueAtTime(0.1, now + 0.34);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const fiberFilter = context.createBiquadFilter();
  fiberFilter.type = "highpass";
  fiberFilter.frequency.setValueAtTime(2300, now);

  const fiberGain = context.createGain();
  fiberGain.gain.setValueAtTime(0.001, now);
  fiberGain.gain.linearRampToValueAtTime(0.03, now + 0.03);
  fiberGain.gain.setValueAtTime(0.018, now + 0.4);
  fiberGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(bodyFilter).connect(bodyGain).connect(context.destination);
  source.connect(fiberFilter).connect(fiberGain).connect(context.destination);
  source.start(now);
  source.stop(now + duration);
}

function playKeyPressSound(context: AudioContext) {
  const now = context.currentTime;
  const click = context.createBufferSource();
  click.buffer = createNoiseBuffer(context, 0.055);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1650, now);
  filter.Q.setValueAtTime(1.2, now);
  const clickGain = context.createGain();
  clickGain.gain.setValueAtTime(0.075, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
  click.connect(filter).connect(clickGain).connect(context.destination);
  click.start(now);
  click.stop(now + 0.06);

  const key = context.createOscillator();
  const keyGain = context.createGain();
  key.type = "triangle";
  key.frequency.setValueAtTime(128, now);
  key.frequency.exponentialRampToValueAtTime(74, now + 0.07);
  keyGain.gain.setValueAtTime(0.04, now);
  keyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
  key.connect(keyGain).connect(context.destination);
  key.start(now);
  key.stop(now + 0.08);
}

function playCutterSound(context: AudioContext) {
  const now = context.currentTime;
  const slide = context.createBufferSource();
  slide.buffer = createNoiseBuffer(context, 0.34);
  const slideFilter = context.createBiquadFilter();
  slideFilter.type = "bandpass";
  slideFilter.frequency.setValueAtTime(2400, now);
  slideFilter.frequency.exponentialRampToValueAtTime(1250, now + 0.32);
  const slideGain = context.createGain();
  slideGain.gain.setValueAtTime(0.001, now);
  slideGain.gain.linearRampToValueAtTime(0.045, now + 0.035);
  slideGain.gain.setValueAtTime(0.026, now + 0.22);
  slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
  slide.connect(slideFilter).connect(slideGain).connect(context.destination);
  slide.start(now);
  slide.stop(now + 0.35);

  const snap = context.createOscillator();
  const snapGain = context.createGain();
  snap.type = "triangle";
  snap.frequency.setValueAtTime(155, now + 0.29);
  snap.frequency.exponentialRampToValueAtTime(68, now + 0.39);
  snapGain.gain.setValueAtTime(0.001, now + 0.29);
  snapGain.gain.linearRampToValueAtTime(0.045, now + 0.3);
  snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  snap.connect(snapGain).connect(context.destination);
  snap.start(now + 0.29);
  snap.stop(now + 0.41);
}

const experience = [
  {
    role: "Software Development Engineer",
    company: "Info Edge · Naukri.com",
    date: "JUL 2026 — PRESENT",
    place: "NOIDA, INDIA",
    points: [
      "Built client-specific taxonomy search with Spring Boot and Elasticsearch, supporting custom labels and rankings while retrieving relevant master data.",
      "Developed Kafka pipelines to synchronize SQL taxonomy data with Elasticsearch through full, incremental and on-demand indexing.",
      "Built an internal AI usage platform for Claude, Codex and Cursor using a cross-platform client and OpenTelemetry pipelines.",
      "Reduced median MIME-detection latency by 63%, from 269ms to 98ms, using a persistent Magika ML daemon over Unix sockets.",
    ],
    stack: "JAVA / SPRING BOOT / KAFKA / ELASTICSEARCH / REDIS / DOCKER / KUBERNETES",
  },
  {
    role: "Software Developer Intern",
    company: "Info Edge · Naukri.com",
    date: "JAN — JUN 2026",
    place: "NOIDA, INDIA",
    points: [
      "Built an AI-assisted test platform with 12 agents for unit, integration, API-functional and Playwright E2E tests, cutting authoring effort by 60–70%.",
      "Added authentication, Jira validation, Redis caching and tag recommendations to the internal AI Test Case Generator.",
      "Built a CI-integrated Playwright failure listener using DOM snapshots, screenshots and stack traces to repair broken locators.",
    ],
    stack: "JAVA / SQL / REDIS / DOCKER / JIRA / AWS / PLAYWRIGHT",
  },
  {
    role: "Backend Engineering Intern",
    company: "Coding Jr",
    date: "JUN — OCT 2025",
    place: "REMOTE",
    points: [
      "Built and maintained Go/Fiber APIs across 10+ portals used by 50+ schools, optimizing GORM queries and dashboard endpoints.",
      "Developed an assessment engine with per-user randomization, timed availability, attempt limits, negative marking and queued answer updates.",
    ],
    stack: "GO / FIBER / REDIS / MYSQL / AWS / DOCKER",
  },
  {
    role: "Frontend Engineering Intern",
    company: "Stealth Startup",
    date: "APR — MAY 2025",
    place: "REMOTE",
    points: [
      "Built an admin portal with JWT cookies, middleware route guards and role-based access control.",
      "Improved page-load time by 30% through lazy loading and optimized asset delivery.",
      "Created reusable UI components and integrated secured REST APIs.",
    ],
    stack: "NEXT.JS / REACT / TYPESCRIPT / TAILWIND / CLERK",
  },
];

const projects = [
  {
    index: "01",
    name: "ForgetAI",
    description:
      "Personal knowledge assistant that ingests PDFs, tweets and notes, then enables natural-language retrieval with format-aware chunking, Pinecone and Redis caching.",
    stack: "GO / GIN / NEXT.JS / MONGODB / REDIS / PINECONE / OPENAI / GCP",
    links: [
      ["LIVE", "https://forgetai.siddhant.cc/"],
      ["CODE", "https://github.com/sidgupt12/forgetai"],
    ],
  },
  {
    index: "02",
    name: "Claude–GitHub–MCP",
    description:
      "Published TypeScript MCP server with 10 tools for repository, branch, file and pull-request workflows through Octokit and Zod.",
    stack: "TYPESCRIPT / NODE.JS / OCTOKIT / GITHUB API / ZOD",
    links: [
      ["NPM", "https://www.npmjs.com/package/claude-github-mcp"],
      ["CODE", "https://github.com/sidgupt12/git-mcp-server"],
    ],
  },
  {
    index: "03",
    name: "InterviewHelp",
    description:
      "Voice-first mock interview platform with live speech processing and performance analytics.",
    stack: "NEXT.JS / CONVEX / ASSEMBLYAI / AMAZON POLLY",
    links: [["CODE", "https://github.com/sidgupt12/interview-help"]],
  },
];

const skills = [
  "Go",
  "Java",
  "Python",
  "TypeScript",
  "JavaScript",
  "SQL",
  "C/C++",
  "Spring Boot",
  "Spring Batch",
  "Gin",
  "Fiber",
  "REST APIs",
  "Kafka",
  "Elasticsearch",
  "Next.js",
  "React",
  "Node.js",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Linux",
  "Git",
  "MongoDB",
  "Redis",
  "MySQL",
  "Pinecone",
  "JUnit",
  "Playwright",
];

export function TypewriterPortfolio({
  isUnlocked: isTypewriterUnlocked = false,
  onNavigate,
  onUnlock,
}: {
  isUnlocked?: boolean;
  onNavigate?: (mode: DeskMode) => void;
  onUnlock?: () => void;
}) {
  const [printState, setPrintState] = useState<PrintState>("idle");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [pressedKey, setPressedKey] = useState<string>();
  const [guideVisible, setGuideVisible] = useState(isTypewriterUnlocked);
  const [draftText, setDraftText] = useState("");
  const [cutterOffset, setCutterOffset] = useState(0);
  const [cutterDragging, setCutterDragging] = useState(false);
  const [cutterKeyboardRun, setCutterKeyboardRun] = useState(false);
  const [topPaperCutting, setTopPaperCutting] = useState(false);
  const finishTimer = useRef<number>();
  const restartTimer = useRef<number>();
  const resetTimer = useRef<number>();
  const keyTimer = useRef<number>();
  const guideTimer = useRef<number>();
  const cutterTimer = useRef<number>();
  const cutterReturnTimer = useRef<number>();
  const cutterDragRef = useRef<CutterDrag>();
  const audioContextRef = useRef<AudioContext>();

  const canType = isTypewriterUnlocked;

  const getAudioContext = useCallback(() => {
    const AudioContextConstructor = window.AudioContext;
    if (!audioContextRef.current) audioContextRef.current = new AudioContextConstructor();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  }, []);

  const printPortfolio = useCallback(() => {
    if (["printing", "tearing", "resetting"].includes(printState)) return;

    if (!isTypewriterUnlocked) {
      window.clearTimeout(guideTimer.current);
      onUnlock?.();
      setGuideVisible(true);
    }

    window.clearTimeout(finishTimer.current);
    window.clearTimeout(restartTimer.current);
    window.clearTimeout(resetTimer.current);

    const start = () => {
      setPrintState("printing");
      playPrintSound(getAudioContext());
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      finishTimer.current = window.setTimeout(
        () => setPrintState("printed"),
        reducedMotion ? 120 : 4300,
      );
    };

    if (printState === "printed") {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPrintState("tearing");
      playTearSound(getAudioContext());
      window.scrollTo({ top: 0, behavior: "smooth" });
      resetTimer.current = window.setTimeout(
        () => setPrintState("resetting"),
        reducedMotion ? 80 : 920,
      );
      restartTimer.current = window.setTimeout(
        start,
        reducedMotion ? 150 : 1080,
      );
      return;
    }

    start();
  }, [getAudioContext, isTypewriterUnlocked, onUnlock, printState]);

  const pressTypewriterKey = useCallback((key: string) => {
    window.clearTimeout(keyTimer.current);
    setPressedKey(key);
    playKeyPressSound(getAudioContext());
    keyTimer.current = window.setTimeout(() => setPressedKey(undefined), 105);
  }, [getAudioContext]);

  const typeDraftCharacter = useCallback((key: string, character: string) => {
    if (!canType) return;
    window.clearTimeout(guideTimer.current);
    setGuideVisible(true);
    pressTypewriterKey(key);
    setDraftText((current) => (
      current.length < MAX_DRAFT_LENGTH ? `${current}${character}` : current
    ));
  }, [canType, pressTypewriterKey]);

  const cutTopPaper = useCallback(() => {
    if (!canType || !guideVisible || topPaperCutting) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTopPaperCutting(true);
    playCutterSound(getAudioContext());
    window.clearTimeout(cutterTimer.current);
    cutterTimer.current = window.setTimeout(() => {
      setGuideVisible(false);
      setDraftText("");
      setTopPaperCutting(false);
    }, reducedMotion ? 80 : 460);
  }, [canType, getAudioContext, guideVisible, topPaperCutting]);

  const resetCutterPosition = useCallback(() => {
    cutterDragRef.current = undefined;
    setCutterDragging(false);
    setCutterOffset(0);
  }, []);

  const startCutterDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!canType || !guideVisible) return;
    const slot = event.currentTarget.parentElement;
    if (!slot) return;

    event.preventDefault();
    setCutterOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
    cutterDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      maxTravel: Math.max(0, slot.clientWidth - event.currentTarget.offsetWidth - 16),
      triggered: false,
    };
    setCutterDragging(true);
  };

  const moveCutter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = cutterDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextOffset = Math.min(drag.maxTravel, Math.max(0, event.clientX - drag.startX));
    setCutterOffset(nextOffset);
    if (drag.maxTravel > 0 && nextOffset / drag.maxTravel >= 0.82 && !drag.triggered) {
      drag.triggered = true;
      cutTopPaper();
      cutterDragRef.current = undefined;
      setCutterDragging(false);
      setCutterOffset(0);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  const releaseCutter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = cutterDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resetCutterPosition();
  };

  const runCutterWithKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!["Enter", " ", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    if (!canType || !guideVisible) return;

    window.clearTimeout(cutterReturnTimer.current);
    setCutterKeyboardRun(true);
    cutTopPaper();
    cutterReturnTimer.current = window.setTimeout(() => setCutterKeyboardRun(false), 720);
  };

  const changeObject = (nextMode: DeskMode) => {
    window.clearTimeout(finishTimer.current);
    window.clearTimeout(restartTimer.current);
    window.clearTimeout(resetTimer.current);
    window.clearTimeout(cutterTimer.current);
    window.clearTimeout(cutterReturnTimer.current);
    const previousAudio = audioContextRef.current;
    audioContextRef.current = undefined;
    if (previousAudio) void previousAudio.close();
    playKeyPressSound(getAudioContext());
    onNavigate?.(nextMode);
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    guideTimer.current = window.setTimeout(
      () => setGuideVisible(true),
      reducedMotion ? 120 : 2450,
    );
    return () => window.clearTimeout(guideTimer.current);
  }, []);

  useEffect(() => {
    const resetInterruptedCutter = () => resetCutterPosition();
    window.addEventListener("pointerup", resetInterruptedCutter);
    window.addEventListener("pointercancel", resetInterruptedCutter);
    window.addEventListener("blur", resetInterruptedCutter);
    window.addEventListener("resize", resetInterruptedCutter);
    return () => {
      window.removeEventListener("pointerup", resetInterruptedCutter);
      window.removeEventListener("pointercancel", resetInterruptedCutter);
      window.removeEventListener("blur", resetInterruptedCutter);
      window.removeEventListener("resize", resetInterruptedCutter);
    };
  }, [resetCutterPosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (resumeOpen || event.repeat) return;
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const isClickableTarget = ["A", "BUTTON"].includes(target.tagName);

      const typedKey = event.key.toUpperCase();
      if (TYPEWRITER_KEYS.includes(typedKey)) {
        typeDraftCharacter(typedKey, event.key);
        return;
      }

      if (event.key === " ") {
        if (isClickableTarget) return;
        event.preventDefault();
        typeDraftCharacter("SPACE", " ");
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        return;
      }

      if (event.key !== "Enter" || isClickableTarget) return;
      event.preventDefault();
      printPortfolio();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [printPortfolio, resumeOpen, typeDraftCharacter]);

  useEffect(() => {
    if (!resumeOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setResumeOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [resumeOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(restartTimer.current);
      window.clearTimeout(resetTimer.current);
      window.clearTimeout(keyTimer.current);
      window.clearTimeout(guideTimer.current);
      window.clearTimeout(cutterTimer.current);
      window.clearTimeout(cutterReturnTimer.current);
      if (audioContextRef.current) void audioContextRef.current.close();
    },
    [],
  );

  const draftLines = draftText ? Math.min(5, Math.max(1, Math.ceil(draftText.length / 28))) : 0;
  const onboardingStyle = { "--draft-extra-height": `${draftLines * 18}px` } as CSSProperties;
  const showTopPaper = guideVisible;
  const showInitialGuide = guideVisible && !isTypewriterUnlocked && printState === "idle";

  return (
    <main className={`typewriter-world typewriter-world--${printState}${showInitialGuide ? " typewriter-world--guided" : ""}`}>
      <div className="typewriter-ambient" aria-hidden="true" />

      <section className="typewriter-stage" aria-label="Portfolio typewriter">
        <div className="typewriter-machine">
          {showTopPaper ? (
            <aside
              className={`typewriter-onboarding${draftText ? " is-typing" : ""}${topPaperCutting ? " is-cutting" : ""}`}
              style={onboardingStyle}
              aria-label="Portfolio instructions and typewriter output"
            >
              <div className={`typewriter-onboarding__paper${isTypewriterUnlocked ? " is-unlocked" : ""}`}>
                <button
                  type="button"
                  className="typewriter-onboarding__action"
                  onClick={(event) => {
                    event.currentTarget.blur();
                    printPortfolio();
                  }}
                  disabled={isTypewriterUnlocked}
                  aria-hidden={isTypewriterUnlocked}
                  aria-label="Print portfolio"
                >
                  <small>PERSONNEL FILE · SG/2026</small>
                  <strong>PORTFOLIO READY</strong>
                  <span className="typewriter-onboarding__desktop">PRESS ENTER OR CLICK HERE TO PRINT</span>
                  <span className="typewriter-onboarding__mobile">TAP HERE TO PRINT</span>
                </button>

                <div
                  className={`typewriter-onboarding__note${draftText ? " has-draft" : ""}`}
                  aria-hidden={!isTypewriterUnlocked}
                >
                  <div className="typewriter-onboarding__prompt" aria-hidden={Boolean(draftText)}>
                    <small>PERSONAL NOTE · SG/2026</small>
                    <strong>TYPE ANYTHING ON THE KEYBOARD</strong>
                    <span>SLIDE TO CUT THE PAPER</span>
                  </div>
                  <div className="typewriter-onboarding__draft" aria-hidden={!draftText}>
                      <small>TYPEWRITTEN NOTE · {draftText.length}/{MAX_DRAFT_LENGTH}</small>
                      <output className="typewriter-onboarding__copy" aria-live="polite">
                        {draftText}<i aria-hidden="true" />
                      </output>
                      <span className="typewriter-onboarding__hint">ENTER PRINTS PORTFOLIO</span>
                      <small className="typewriter-onboarding__no-backspace">
                        NO BACKSPACE—SLIDE IT OUT AND START AGAIN. VERY ANALOG.
                      </small>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}

          <div className="typewriter-carriage" aria-hidden="true">
            <span className="typewriter-carriage__knob" />
            <span className="typewriter-carriage__rail" />
            <span className="typewriter-carriage__knob" />
          </div>

          <div className="typewriter-housing">
            <div className="typewriter-housing__topline">
              <span>PERSONAL ARCHIVE</span>
              <ChromeSiddhantLogo />
              <span>OLIVETTI LETTERA 32</span>
            </div>

            <span className="sr-only" aria-live="polite">
              {printState === "printing"
                ? "Printing portfolio"
                : printState === "tearing"
                  ? "Removing printed portfolio"
                  : printState === "printed"
                    ? "Portfolio printed"
                    : "Portfolio machine ready"}
            </span>

            <div
              className={`typewriter-slot${canType && showTopPaper ? " is-ready" : " is-locked"}${cutterDragging ? " is-dragging" : ""}`}
            >
              <span className="typewriter-slot__track" aria-hidden="true" />
              <button
                type="button"
                className={`typewriter-cutter${cutterKeyboardRun ? " is-running" : ""}`}
                style={{ transform: `translateX(${cutterOffset}px)` }}
                aria-label={canType && showTopPaper
                  ? "Slide to cut the note paper"
                  : "Print the portfolio to unlock the paper cutter"}
                aria-disabled={!canType || !showTopPaper}
                onPointerDown={startCutterDrag}
                onPointerMove={moveCutter}
                onPointerUp={releaseCutter}
                onPointerCancel={releaseCutter}
                onLostPointerCapture={resetCutterPosition}
                onKeyDown={runCutterWithKeyboard}
              >
                <i aria-hidden="true" />
              </button>
            </div>

            <div className="typewriter-keyboard">
              <div className="typewriter-keys" aria-label="Working typewriter keys">
                {TYPEWRITER_ROWS.map((row) => (
                  <div className="typewriter-key-row" key={row}>
                    {row.split("").map((key) => (
                      <button
                        type="button"
                        key={key}
                        className={pressedKey === key ? "is-pressed" : ""}
                        onClick={() => typeDraftCharacter(key, key)}
                        disabled={!canType}
                        aria-label={`Type ${key}`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="typewriter-key-row typewriter-key-row--utility">
                  <button
                    type="button"
                    className={`typewriter-space${pressedKey === "SPACE" ? " is-pressed" : ""}`}
                    onClick={() => typeDraftCharacter("SPACE", " ")}
                    disabled={!canType}
                    aria-label="Type a space"
                  >
                    SPACE
                  </button>
                </div>
              </div>

              <div className="typewriter-object-keys" aria-label="Switch desk object">
                <em>SWITCH OBJECT</em>
                <button type="button" onClick={() => changeObject("cassette")}>
                  <Music2 aria-hidden="true" />
                  <span>RECORD</span>
                  <small>PLAY</small>
                </button>
                <button type="button" onClick={() => changeObject("blackjack")}>
                  <Layers3 aria-hidden="true" />
                  <span>CARDS</span>
                  <small>DEAL</small>
                </button>
              </div>

              <div className="typewriter-return-station">
                <button
                  type="button"
                  className="typewriter-return"
                  onClick={printPortfolio}
                  disabled={["printing", "tearing", "resetting"].includes(printState)}
                  aria-label={printState === "printed" ? "Print portfolio again" : "Print portfolio"}
                >
                  <span className="typewriter-return__arrow">↵</span>
                  <span>
                    {printState === "printed"
                      ? "NEW CV"
                      : printState === "tearing"
                        ? "TEAR"
                        : printState === "resetting"
                          ? "LOAD"
                          : printState === "printing"
                            ? "PRINTING"
                            : "PRINT CV"}
                  </span>
                </button>

                {showInitialGuide ? (
                  <span className="typewriter-guide-arrow" aria-hidden="true">
                    <em>PRESS ENTER</em>
                    <svg viewBox="0 0 88 46">
                      <path d="M4 39 C32 42 55 28 72 10" />
                      <path d="M60 13 L73 9 L69 22" />
                    </svg>
                  </span>
                ) : null}

              </div>
            </div>
          </div>

          <div className="typewriter-feet" aria-hidden="true">
            <span />
            <span />
          </div>
        </div>

        <div className="paper-feed" aria-live="polite">
          <div className="paper-feed__clip">
            <article id="portfolio-paper" className="resume-paper">
              <div className="paper-perforation paper-perforation--left" aria-hidden="true" />
              <div className="paper-perforation paper-perforation--right" aria-hidden="true" />

              <div className="resume-paper__inner">
                <div className="resume-register">
                  <span>PERSONNEL FILE № SG/2026</span>
                  <span>ISSUED 14·08·26</span>
                </div>

                <header className="resume-header">
                  <p className="resume-kicker">SOFTWARE ENGINEER · BACKEND SYSTEMS · AI PRODUCTS</p>
                  <h1>SIDDHANT<br />GUPTA</h1>
                  <div className="resume-header__meta">
                    <span><MapPin aria-hidden="true" /> India</span>
                    <a href="mailto:sidgupt12@gmail.com"><Mail aria-hidden="true" /> sidgupt12@gmail.com</a>
                    <a href="tel:+919792978291">+91 9792978291</a>
                    <a href="https://github.com/sidgupt12" target="_blank" rel="noreferrer">github.com/sidgupt12</a>
                    <a href="https://linkedin.com/in/siddhantgupta12" target="_blank" rel="noreferrer">linkedin.com/in/siddhantgupta12</a>
                  </div>
                </header>

                <div className="resume-rule"><span>PROFILE</span></div>
                <section className="resume-intro">
                  <p>
                    I build dependable systems where product thinking meets engineering detail—search and data
                    pipelines, fast APIs, automation infrastructure and useful AI tools. I’m currently a Software
                    Development Engineer at Info Edge and an Information Technology graduate.
                  </p>
                  <button
                    type="button"
                    className="resume-download"
                    onClick={() => setResumeOpen(true)}
                  >
                    <Download aria-hidden="true" /> RESUME.PDF
                  </button>
                </section>

                <div className="resume-rule"><span>WORK RECORD</span></div>
                <section className="resume-experience">
                  {experience.map((item, index) => (
                    <article className="resume-job" key={item.company}>
                      <div className="resume-job__number">0{index + 1}</div>
                      <div className="resume-job__body">
                        <div className="resume-job__heading">
                          <div>
                            <h2>{item.role}</h2>
                            <h3>{item.company}</h3>
                          </div>
                          <p>{item.date}<br />{item.place}</p>
                        </div>
                        <ul>
                          {item.points.map((point) => <li key={point}>{point}</li>)}
                        </ul>
                        <p className="resume-stack">{item.stack}</p>
                      </div>
                    </article>
                  ))}
                </section>

                <div className="resume-rule"><span>SELECTED BUILDS</span></div>
                <section className="resume-projects">
                  {projects.map((project) => (
                    <article className="resume-project" key={project.name}>
                      <span className="resume-project__index">{project.index}</span>
                      <div>
                        <div className="resume-project__title">
                          <h2>{project.name}</h2>
                          <div>
                            {project.links.map(([label, url]) => (
                              <a href={url} target="_blank" rel="noreferrer" key={label}>
                                {label}<ArrowUpRight aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                        </div>
                        <p>{project.description}</p>
                        <p className="resume-stack">{project.stack}</p>
                      </div>
                    </article>
                  ))}
                </section>

                <div className="resume-rule"><span>CODE ACTIVITY</span></div>
                <figure className="resume-heatmap">
                  <img
                    src="https://ghchart.rshah.org/sidgupt12"
                    alt="Siddhant Gupta's GitHub contribution heatmap"
                    loading="lazy"
                  />
                  <figcaption>
                    PUBLIC GITHUB ACTIVITY · MOST WORK COMMITS LIVE ON ORGANISATION GITLAB
                  </figcaption>
                </figure>

                <div className="resume-paper__columns">
                  <section>
                    <div className="resume-rule"><span>TOOLBOX</span></div>
                    <div className="resume-skills">
                      {skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </div>
                  </section>

                  <section>
                    <div className="resume-rule"><span>EDUCATION</span></div>
                    <div className="resume-note">
                      <strong>B.TECH · INFORMATION TECHNOLOGY</strong>
                      <span>Dr. APJ Abdul Kalam Technical University</span>
                      <span>2022—2026 · CGPA 8.5</span>
                    </div>

                    <div className="resume-rule resume-rule--minor"><span>FIELD NOTES</span></div>
                    <ul className="resume-field-notes">
                      <li>Led a 30-member programming club and organized events for 150+ participants.</li>
                      <li>Co-authored two Scopus-indexed papers at IEEE ICCSC 2026 and AECE 2025.</li>
                    </ul>
                  </section>
                </div>

                <footer className="resume-footer">
                  <span className="resume-stamp">OPEN TO<br />GOOD WORK</span>
                  <div>
                    <p>END OF RECORD · THANK YOU FOR READING</p>
                    <a href="mailto:sidgupt12@gmail.com">LET’S BUILD SOMETHING →</a>
                  </div>
                  <span>SG<br />26</span>
                </footer>
              </div>
            </article>
          </div>
        </div>
      </section>

      {resumeOpen ? (
        <div className="resume-preview" role="presentation" onMouseDown={() => setResumeOpen(false)}>
          <section
            className="resume-preview__window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <strong id="resume-preview-title">SIDDHANT GUPTA · CV</strong>
                <span>LOCAL ARCHIVE COPY</span>
              </div>
              <a href="/Siddhant_CV.pdf" download="Siddhant_Gupta_CV.pdf">
                <Download aria-hidden="true" /> DOWNLOAD
              </a>
              <button type="button" onClick={() => setResumeOpen(false)} aria-label="Close résumé">
                <X aria-hidden="true" />
              </button>
            </header>
            <iframe title="Siddhant Gupta CV" src="/Siddhant_CV.pdf#view=FitH&toolbar=0" />
          </section>
        </div>
      ) : null}
    </main>
  );
}
