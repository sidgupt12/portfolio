import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, Mail, MapPin } from "lucide-react";
import "./TypewriterPortfolio.css";

type PrintState = "idle" | "printing" | "printed" | "tearing" | "resetting";

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

function TypewriterChromeLogo() {
  return (
    <svg
      className="typewriter-chrome-logo"
      viewBox="0 0 190 56"
      role="img"
      aria-label="Siddhant"
    >
      <defs>
        <linearGradient id="machine-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#77736e" />
          <stop offset="0.17" stopColor="#ffffff" />
          <stop offset="0.34" stopColor="#aaa7a3" />
          <stop offset="0.48" stopColor="#ffffff" />
          <stop offset="0.61" stopColor="#706d69" />
          <stop offset="0.8" stopColor="#f0eeea" />
          <stop offset="1" stopColor="#96918c" />
        </linearGradient>
      </defs>
      <text x="93" y="36" textAnchor="middle" fill="url(#machine-chrome)">siddhant</text>
      <path d="M27 43 C72 51 129 50 165 40" pathLength="1" />
    </svg>
  );
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

export function TypewriterPortfolio() {
  const [printState, setPrintState] = useState<PrintState>("idle");
  const finishTimer = useRef<number>();
  const restartTimer = useRef<number>();
  const resetTimer = useRef<number>();
  const audioContextRef = useRef<AudioContext>();

  const getAudioContext = useCallback(() => {
    const AudioContextConstructor = window.AudioContext;
    if (!audioContextRef.current) audioContextRef.current = new AudioContextConstructor();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  }, []);

  const printPortfolio = useCallback(() => {
    if (["printing", "tearing", "resetting"].includes(printState)) return;

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
  }, [getAudioContext, printState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      const target = event.target as HTMLElement;
      if (["A", "BUTTON", "INPUT", "TEXTAREA"].includes(target.tagName)) return;
      event.preventDefault();
      printPortfolio();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [printPortfolio]);

  useEffect(
    () => () => {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(restartTimer.current);
      window.clearTimeout(resetTimer.current);
      if (audioContextRef.current) void audioContextRef.current.close();
    },
    [],
  );

  return (
    <main className={`typewriter-world typewriter-world--${printState}`}>
      <div className="typewriter-ambient" aria-hidden="true" />

      <section className="typewriter-stage" aria-label="Portfolio typewriter">
        <div className="typewriter-machine">
          <div className="typewriter-carriage" aria-hidden="true">
            <span className="typewriter-carriage__knob" />
            <span className="typewriter-carriage__rail" />
            <span className="typewriter-carriage__knob" />
          </div>

          <div className="typewriter-housing">
            <div className="typewriter-housing__topline">
              <span>PERSONAL ARCHIVE</span>
              <TypewriterChromeLogo />
              <span>MODEL SG–26</span>
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

            <div className="typewriter-slot" aria-hidden="true">
              <span />
            </div>

            <div className="typewriter-keyboard">
              <div className="typewriter-keys" aria-hidden="true">
                {"QWERTYUIOP".split("").map((key) => (
                  <span key={key}>{key}</span>
                ))}
                {"ASDFGHJKL".split("").map((key) => (
                  <span key={key}>{key}</span>
                ))}
              </div>

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
                    ? "AGAIN"
                    : printState === "tearing"
                      ? "TEAR"
                      : printState === "resetting"
                        ? "LOAD"
                        : "RETURN"}
                </span>
              </button>
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
                  <a
                    className="resume-download"
                    href="https://drive.google.com/file/d/1z3TnNM1jYsA3MAeL19_F5KRYYIDjUb2o/view?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download aria-hidden="true" /> RESUME.PDF
                  </a>
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
    </main>
  );
}
