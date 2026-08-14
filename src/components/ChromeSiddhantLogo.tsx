import { useId } from "react";
import "./ChromeSiddhantLogo.css";

export function ChromeSiddhantLogo() {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      className="chrome-siddhant-logo"
      viewBox="0 0 190 56"
      role="img"
      aria-label="Siddhant"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#77736e" />
          <stop offset="0.17" stopColor="#ffffff" />
          <stop offset="0.34" stopColor="#aaa7a3" />
          <stop offset="0.48" stopColor="#ffffff" />
          <stop offset="0.61" stopColor="#706d69" />
          <stop offset="0.8" stopColor="#f0eeea" />
          <stop offset="1" stopColor="#96918c" />
        </linearGradient>
      </defs>
      <text x="93" y="36" textAnchor="middle" fill={`url(#${gradientId})`}>
        siddhant
      </text>
      <path
        d="M27 43 C72 51 129 50 165 40"
        pathLength="1"
        stroke={`url(#${gradientId})`}
      />
    </svg>
  );
}
