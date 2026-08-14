import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { FileText, Layers3, Pause, Play, RotateCcw, Square } from "lucide-react";
import type { DeskMode } from "./ClassicDesk";
import { ChromeSiddhantLogo } from "./ChromeSiddhantLogo";
import "./CassettePlayer.css";

export type PlaylistTrack = {
  title: string;
  artist: string;
  src: string;
  shell: string;
  label: string;
  accent: string;
};

export type CassettePlayerProps = {
  tracks: readonly PlaylistTrack[];
  onNavigate?: (mode: DeskMode) => void;
};

type KnobDrag = {
  pointerId: number;
  centerX: number;
  centerY: number;
  lastAngle?: number;
  volume: number;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function createTapeNoise(context: AudioContext, duration: number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

function playTapeChangeSound(context: AudioContext) {
  const now = context.currentTime;
  const slide = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  slide.buffer = createTapeNoise(context, 0.28);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1850, now);
  filter.frequency.exponentialRampToValueAtTime(620, now + 0.27);
  filter.Q.setValueAtTime(0.8, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.065, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  slide.connect(filter).connect(gain).connect(context.destination);
  slide.start(now);
  slide.stop(now + 0.29);

  [0.02, 0.19].forEach((delay, index) => {
    const clack = context.createOscillator();
    const clackGain = context.createGain();
    clack.type = "triangle";
    clack.frequency.setValueAtTime(index ? 105 : 145, now + delay);
    clack.frequency.exponentialRampToValueAtTime(54, now + delay + 0.075);
    clackGain.gain.setValueAtTime(index ? 0.075 : 0.045, now + delay);
    clackGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.085);
    clack.connect(clackGain).connect(context.destination);
    clack.start(now + delay);
    clack.stop(now + delay + 0.09);
  });
}

export function CassettePlayer({ tracks, onNavigate }: CassettePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const knobDragRef = useRef<KnobDrag>();
  const effectsAudioRef = useRef<AudioContext>();
  const mediaAudioRef = useRef<AudioContext>();
  const mediaSourceRef = useRef<MediaElementAudioSourceNode>();
  const analyserRef = useRef<AnalyserNode>();
  const analysedElementRef = useRef<HTMLAudioElement>();
  const visualizerFrameRef = useRef<number>();
  const frequencyDataRef = useRef<Uint8Array>();
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [status, setStatus] = useState("TAPE LOADED");
  const track = tracks[trackIndex];

  const stopVisualizer = useCallback(() => {
    window.cancelAnimationFrame(visualizerFrameRef.current ?? 0);
    visualizerFrameRef.current = undefined;
    Array.from(meterRef.current?.children ?? []).forEach((bar) => {
      (bar as HTMLElement).style.removeProperty("height");
    });
  }, []);

  const disposeVisualizer = useCallback(() => {
    stopVisualizer();
    mediaSourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    const mediaAudio = mediaAudioRef.current;
    mediaAudioRef.current = undefined;
    mediaSourceRef.current = undefined;
    analyserRef.current = undefined;
    analysedElementRef.current = undefined;
    frequencyDataRef.current = undefined;
    if (mediaAudio) void mediaAudio.close();
  }, [stopVisualizer]);

  const startVisualizer = useCallback(async (audio: HTMLAudioElement) => {
    if (!mediaAudioRef.current || analysedElementRef.current !== audio) {
      disposeVisualizer();
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(context.destination);
      mediaAudioRef.current = context;
      mediaSourceRef.current = source;
      analyserRef.current = analyser;
      analysedElementRef.current = audio;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    const context = mediaAudioRef.current;
    const analyser = analyserRef.current;
    const frequencyData = frequencyDataRef.current;
    if (!context || !analyser || !frequencyData) return;
    if (context.state === "suspended") await context.resume();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopVisualizer();
      return;
    }

    window.cancelAnimationFrame(visualizerFrameRef.current ?? 0);
    const renderSignal = () => {
      analyser.getByteFrequencyData(frequencyData);

      Array.from(meterRef.current?.children ?? []).forEach((bar, index) => {
        const bin = Math.min(frequencyData.length - 1, 2 + index * 4);
        const level = frequencyData[bin] / 255;
        (bar as HTMLElement).style.height = `${Math.round(4 + level * 16)}px`;
      });

      visualizerFrameRef.current = window.requestAnimationFrame(renderSignal);
    };
    renderSignal();
  }, [disposeVisualizer, stopVisualizer]);

  const getEffectsAudio = () => {
    if (!effectsAudioRef.current) effectsAudioRef.current = new AudioContext();
    if (effectsAudioRef.current.state === "suspended") void effectsAudioRef.current.resume();
    return effectsAudioRef.current;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        audio.muted = false;
        await startVisualizer(audio);
        await audio.play();
        setIsPlaying(true);
        setStatus("PLAYING");
      } catch {
        stopVisualizer();
        setStatus("PRESS PLAY AGAIN");
      }
    } else {
      audio.pause();
      stopVisualizer();
      setIsPlaying(false);
      setStatus("PAUSED");
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    stopVisualizer();
    setCurrentTime(0);
    setIsPlaying(false);
    setStatus("STOPPED");
  };

  const rewind = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 8);
    setCurrentTime(audio.currentTime);
    setStatus("REWIND · 8 SEC");
  };

  const silenceAndUnload = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.muted = true;
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    disposeVisualizer();
  };

  const changeSource = (nextMode: DeskMode) => {
    silenceAndUnload();
    const effectsAudio = effectsAudioRef.current;
    effectsAudioRef.current = undefined;
    if (effectsAudio) void effectsAudio.close();
    setIsPlaying(false);
    onNavigate?.(nextMode);
  };

  const selectTrack = (nextIndex: number) => {
    playTapeChangeSound(getEffectsAudio());
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    disposeVisualizer();
    setTrackIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setStatus(`TAPE ${String(nextIndex + 1).padStart(2, "0")} LOADED`);
  };

  const moveKnob = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = knobDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const offsetX = event.clientX - drag.centerX;
    const offsetY = event.clientY - drag.centerY;
    if (Math.hypot(offsetX, offsetY) < 10) return;

    const nextAngle = Math.atan2(offsetY, offsetX) * (180 / Math.PI);
    if (drag.lastAngle === undefined) {
      drag.lastAngle = nextAngle;
      return;
    }
    let angleDelta = nextAngle - drag.lastAngle;
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    const nextVolume = clampVolume(drag.volume + angleDelta / 270);
    drag.lastAngle = nextAngle;
    drag.volume = nextVolume;
    setVolume(nextVolume);
  };

  const releaseKnob = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (knobDragRef.current?.pointerId !== event.pointerId) return;
    knobDragRef.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const turnKnobWithKeys = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
    setVolume((current) => clampVolume(current + direction * 0.05));
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      audio.pause();
      audio.muted = true;
      audio.removeAttribute("src");
      audio.load();
      disposeVisualizer();
    };
  }, [disposeVisualizer, track?.src]);

  useEffect(
    () => () => {
      if (effectsAudioRef.current) void effectsAudioRef.current.close();
      disposeVisualizer();
    },
    [disposeVisualizer],
  );

  if (!track) return null;

  const transportMode = isPlaying
    ? "playing"
    : status === "PAUSED"
      ? "paused"
      : status === "STOPPED"
        ? "stopped"
        : "ready";

  const tapeStyle = {
    "--tape-shell": track.shell,
    "--tape-label": track.label,
    "--tape-accent": track.accent,
    "--knob-angle": `${-135 + volume * 270}deg`,
  } as CSSProperties;

  return (
    <main className="cassette-room" style={tapeStyle}>
      <section className={`cassette-deck ${isPlaying ? "is-playing" : ""}`} aria-label="Retro cassette player">
        <div className="cassette-deck__handle" aria-hidden="true" />

        <div className="cassette-deck__face">
          <header className="cassette-deck__header">
            <div className="cassette-deck__brand">
              <ChromeSiddhantLogo />
            </div>
            <nav className="cassette-source-switch" aria-label="Switch portfolio object">
              <b>CHANGE OBJECT</b>
              <button type="button" onClick={() => changeSource("typewriter")}>
                <FileText aria-hidden="true" /><span>TYPEWRITER</span><small>PRINT CV</small>
              </button>
              <button type="button" onClick={() => changeSource("blackjack")}>
                <Layers3 aria-hidden="true" /><span>CASINO</span><small>PLAY 21</small>
              </button>
            </nav>
            <div className="cassette-deck__meter" ref={meterRef} aria-hidden="true">
              {Array.from({ length: 11 }, (_, index) => <i key={index} />)}
            </div>
          </header>

          <div className="cassette-deck__layout">
            <div className="cassette-speaker" aria-hidden="true"><span /></div>

            <div className="cassette-bay">
              <div className="cassette-tape">
                <div className="cassette-tape__wear" aria-hidden="true" />
                <div className="cassette-tape__label">
                  <span>ARCHIVE TAPE № {String(trackIndex + 1).padStart(2, "0")}</span>
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </div>
                <div className="cassette-tape__window">
                  <div className="cassette-reel"><i /></div>
                  <div className="cassette-tape__ribbon" />
                  <div className="cassette-reel"><i /></div>
                </div>
                <div className="cassette-tape__screws" aria-hidden="true"><i /><i /><i /><i /></div>
              </div>
            </div>

            <div className="cassette-controls">
              <span
                className="cassette-controls__status"
                data-mode={transportMode}
                aria-live="polite"
              >
                {status}
              </span>
              <div className="cassette-controls__time"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              <input
                aria-label="Track position"
                className="cassette-controls__seek"
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => {
                  const nextTime = Number(event.target.value);
                  if (audioRef.current) audioRef.current.currentTime = nextTime;
                  setCurrentTime(nextTime);
                }}
              />
              <div className="cassette-controls__buttons">
                <button type="button" onClick={rewind} aria-label="Rewind eight seconds"><RotateCcw aria-hidden="true" /><span>REW</span></button>
                <button type="button" className="cassette-controls__play" onClick={togglePlayback}>
                  {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                  <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
                </button>
                <button type="button" onClick={stop} aria-label="Stop"><Square aria-hidden="true" /><span>STOP</span></button>
              </div>
              <div className="cassette-volume">
                <span>VOLUME</span>
                <div
                  className="cassette-volume__knob"
                  role="slider"
                  tabIndex={0}
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(volume * 100)}
                  onPointerDown={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const centerX = bounds.left + bounds.width / 2;
                    const centerY = bounds.top + bounds.height / 2;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    knobDragRef.current = {
                      pointerId: event.pointerId,
                      centerX,
                      centerY,
                      lastAngle: Math.hypot(event.clientX - centerX, event.clientY - centerY) < 10
                        ? undefined
                        : Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI),
                      volume,
                    };
                  }}
                  onPointerMove={moveKnob}
                  onPointerUp={releaseKnob}
                  onPointerCancel={releaseKnob}
                  onLostPointerCapture={() => { knobDragRef.current = undefined; }}
                  onKeyDown={turnKnobWithKeys}
                ><i /></div>
                <small>PRESS + DRAG</small>
              </div>
            </div>
          </div>

          <div className="cassette-library" aria-label="Music library">
            <span>A FEW OF MY<br />FAVOURITE TRACKS</span>
            <div>
              {tracks.map((item, index) => (
                <button
                  type="button"
                  key={item.src}
                  className={index === trackIndex ? "is-active" : ""}
                  style={{
                    "--library-shell": item.shell,
                    "--library-label": item.label,
                    "--library-accent": item.accent,
                  } as CSSProperties}
                  onClick={() => selectTrack(index)}
                >
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>{item.title}</span>
                  <small>{item.artist}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <audio
          key={track.src}
          ref={audioRef}
          src={track.src}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            setCurrentTime(0);
            setIsPlaying(false);
            setStatus("END OF SIDE A");
            stopVisualizer();
          }}
          onError={() => {
            stopVisualizer();
            setStatus("TAPE UNAVAILABLE");
          }}
        />
      </section>
    </main>
  );
}
