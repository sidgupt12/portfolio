import { useEffect, useId, useRef, useState } from "react";
import "./SignatureCurtain.css";

export type SignatureCurtainProps = {
  name?: string;
  duration?: number;
  onComplete?: () => void;
  oncePerSession?: boolean;
  className?: string;
};

const SESSION_KEY = "siddhant-signature-curtain-seen";

export function SignatureCurtain({
  name = "siddhant",
  duration = 3200,
  onComplete,
  oncePerSession = false,
  className = "",
}: SignatureCurtainProps) {
  const [phase, setPhase] = useState<"enter" | "open" | "done">(() => {
    if (typeof window === "undefined" || !oncePerSession) return "enter";
    return sessionStorage.getItem(SESSION_KEY) ? "done" : "enter";
  });
  const onCompleteRef = useRef(onComplete);
  const chromeGradientId = useId().replace(/:/g, "");
  const chromeEdgeId = useId().replace(/:/g, "");
  const chromeFilterId = useId().replace(/:/g, "");

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (phase === "done") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const openAt = prefersReducedMotion ? 80 : Math.max(1900, duration - 900);
    const finishAt = prefersReducedMotion ? 180 : duration;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const openTimer = window.setTimeout(() => setPhase("open"), openAt);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = previousOverflow;

      if (oncePerSession) sessionStorage.setItem(SESSION_KEY, "true");
      onCompleteRef.current?.();
    }, finishAt);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = previousOverflow;
    };
    // This effect owns one uninterrupted entrance timeline. Re-running when the
    // phase changes would restart the animation as the panels begin to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, oncePerSession]);

  if (phase === "done") return null;

  return (
    <div
      className={`signature-curtain signature-curtain--${phase} ${className}`.trim()}
      role="status"
      aria-label={`${name} portfolio is loading`}
    >
      <div className="signature-curtain__texture" aria-hidden="true" />

      <div className="signature-curtain__mark" aria-hidden="true">
        <svg
          className="signature-curtain__signature"
          viewBox="0 0 760 260"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={chromeGradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0" stopColor="#d7d5d1" />
              <stop offset="0.16" stopColor="#ffffff" />
              <stop offset="0.3" stopColor="#dedcd8" />
              <stop offset="0.44" stopColor="#fdfcf9" />
              <stop offset="0.52" stopColor="#ffffff" />
              <stop offset="0.6" stopColor="#aaa7a3" />
              <stop offset="0.77" stopColor="#efede9" />
              <stop offset="1" stopColor="#cbc8c4" />
            </linearGradient>
            <linearGradient
              id={chromeEdgeId}
              x1="-1"
              y1="0"
              x2="0"
              y2="0"
            >
              <stop offset="0" stopColor="#8c857d" stopOpacity="0" />
              <stop offset="0.45" stopColor="#fffdf8" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fffdf8" stopOpacity="0.95" />
              <stop offset="0.55" stopColor="#fffdf8" stopOpacity="0" />
              <stop offset="1" stopColor="#8c857d" stopOpacity="0" />
              <animate
                attributeName="x1"
                values="-1;1"
                dur="2.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </linearGradient>
            <filter
              id={chromeFilterId}
              x="-20%"
              y="-30%"
              width="140%"
              height="170%"
              colorInterpolationFilters="sRGB"
            >
              <feDropShadow
                in="SourceAlpha"
                dx="0"
                dy="4"
                stdDeviation="2.4"
                floodColor="#000000"
                floodOpacity="0.82"
                result="contactShadow"
              />
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.1" result="softAlpha" />
              <feOffset in="SourceAlpha" dx="0" dy="2.4" result="alphaDown" />
              <feComposite
                in="SourceAlpha"
                in2="alphaDown"
                operator="out"
                result="topEdge"
              />
              <feGaussianBlur in="topEdge" stdDeviation="0.65" result="softTopEdge" />
              <feFlood floodColor="#ffffff" floodOpacity="0.95" result="topLightColor" />
              <feComposite
                in="topLightColor"
                in2="softTopEdge"
                operator="in"
                result="topRim"
              />
              <feOffset in="SourceAlpha" dx="0" dy="-2.8" result="alphaUp" />
              <feComposite
                in="SourceAlpha"
                in2="alphaUp"
                operator="out"
                result="bottomEdge"
              />
              <feGaussianBlur in="bottomEdge" stdDeviation="0.8" result="softBottomEdge" />
              <feFlood floodColor="#55514d" floodOpacity="0.72" result="shadeColor" />
              <feComposite
                in="shadeColor"
                in2="softBottomEdge"
                operator="in"
                result="bottomRim"
              />
              <feDiffuseLighting
                in="softAlpha"
                surfaceScale="14"
                diffuseConstant="0.7"
                lightingColor="#dedbd6"
                result="softVolume"
              >
                <fePointLight x="510" y="20" z="145" />
              </feDiffuseLighting>
              <feComposite
                in="softVolume"
                in2="SourceAlpha"
                operator="in"
                result="volumeSurface"
              />
              <feBlend
                in="SourceGraphic"
                in2="volumeSurface"
                mode="screen"
                result="raisedChrome"
              />
              <feSpecularLighting
                in="softAlpha"
                surfaceScale="19"
                specularConstant="2.15"
                specularExponent="24"
                lightingColor="#ffffff"
                result="specular"
              >
                <fePointLight x="210" y="-80" z="175" />
              </feSpecularLighting>
              <feComposite
                in="specular"
                in2="SourceAlpha"
                operator="in"
                result="litSurface"
              />
              <feMerge>
                <feMergeNode in="contactShadow" />
                <feMergeNode in="raisedChrome" />
                <feMergeNode in="bottomRim" />
                <feMergeNode in="topRim" />
                <feMergeNode in="litSurface" />
              </feMerge>
            </filter>
          </defs>
          <text
            className="signature-curtain__ghost"
            x="380"
            y="168"
            textAnchor="middle"
          >
            {name}
          </text>
          <text
            className="signature-curtain__liquid-bed"
            x="380"
            y="168"
            textAnchor="middle"
          >
            {name}
          </text>
          <text
            className="signature-curtain__ink"
            x="380"
            y="168"
            textAnchor="middle"
            fill={`url(#${chromeGradientId})`}
            filter={`url(#${chromeFilterId})`}
          >
            {name}
          </text>
          <text
            className="signature-curtain__reflection"
            x="380"
            y="168"
            textAnchor="middle"
            stroke={`url(#${chromeEdgeId})`}
          >
            {name}
          </text>
          <path
            className="signature-curtain__flourish"
            d="M130 201 C264 229 493 229 641 192 C682 182 696 197 662 212 C619 231 548 231 501 221"
            pathLength="1"
            stroke={`url(#${chromeGradientId})`}
            filter={`url(#${chromeFilterId})`}
          />
        </svg>
      </div>
    </div>
  );
}
