import "./SiddhantWordmark.css";

type SiddhantWordmarkProps = {
  className?: string;
  text?: string;
};

export function SiddhantWordmark({
  className = "",
  text = "siddhant",
}: SiddhantWordmarkProps) {
  return (
    <span
      className={`siddhant-wordmark ${className}`.trim()}
      aria-label={text}
    >
      <span className="siddhant-wordmark__script" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
