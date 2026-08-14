import "./PlayingCard.css";

export type PlayingCardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type PlayingCardSuit = "clubs" | "diamonds" | "hearts" | "spades";

export type CardValue = {
  rank: PlayingCardRank;
  suit: PlayingCardSuit;
};

export type PlayingCardProps = CardValue & {
  className?: string;
  faceDown?: boolean;
  width?: number;
};

type Pip = { x: number; y: number; flip?: boolean };

const suitPaths: Record<PlayingCardSuit, string> = {
  clubs: "M12 2a4.1 4.1 0 0 0-4.1 4.1c0 .93.31 1.79.83 2.48a4.1 4.1 0 1 0 2.9 7.33c-.28 2.2-1.02 3.72-2.43 5.09h5.6c-1.41-1.37-2.15-2.89-2.43-5.09a4.1 4.1 0 1 0 2.9-7.33c.52-.69.83-1.55.83-2.48A4.1 4.1 0 0 0 12 2Z",
  diamonds: "M12 1.5 19.3 12 12 22.5 4.7 12Z",
  hearts: "M12 21.4C6.1 15.9 2.6 12.4 2.6 8.6a4.85 4.85 0 0 1 4.85-4.85c1.8 0 3.5.87 4.55 2.33a5.63 5.63 0 0 1 4.55-2.33A4.85 4.85 0 0 1 21.4 8.6c0 3.8-3.5 7.3-9.4 12.8Z",
  spades: "M12 1.8C6.9 7.2 3.6 10.3 3.6 13.6a4.35 4.35 0 0 0 7.1 3.36c-.3 1.9-1 3.26-2.35 4.54h7.3c-1.35-1.28-2.05-2.64-2.35-4.54a4.35 4.35 0 0 0 7.1-3.36c0-3.3-3.3-6.4-8.4-11.8Z",
};

const pipLayouts: Partial<Record<PlayingCardRank, readonly Pip[]>> = {
  "2": [{ x: 50, y: 0 }, { x: 50, y: 100, flip: true }],
  "3": [{ x: 50, y: 0 }, { x: 50, y: 50 }, { x: 50, y: 100, flip: true }],
  "4": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "5": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 50 }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "6": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 50 }, { x: 100, y: 50 }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "7": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 25 }, { x: 0, y: 50 }, { x: 100, y: 50 }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "8": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 25 }, { x: 0, y: 50 }, { x: 100, y: 50 }, { x: 50, y: 75, flip: true }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "9": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 33 }, { x: 100, y: 33 }, { x: 50, y: 50 }, { x: 0, y: 67, flip: true }, { x: 100, y: 67, flip: true }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
  "10": [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 17 }, { x: 0, y: 33 }, { x: 100, y: 33 }, { x: 0, y: 67, flip: true }, { x: 100, y: 67, flip: true }, { x: 50, y: 83, flip: true }, { x: 0, y: 100, flip: true }, { x: 100, y: 100, flip: true }],
};

const redSuits = new Set<PlayingCardSuit>(["diamonds", "hearts"]);
const courtRanks = new Set<PlayingCardRank>(["J", "Q", "K"]);

function SuitIcon({ suit, className = "" }: { suit: PlayingCardSuit; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={suitPaths[suit]} />
    </svg>
  );
}

function CornerIndex({ rank, suit, flipped = false }: CardValue & { flipped?: boolean }) {
  return (
    <div className={`playing-card__corner ${flipped ? "is-flipped" : ""}`}>
      <span>{rank}</span>
      <SuitIcon suit={suit} />
    </div>
  );
}

export function PlayingCard({ rank, suit, faceDown = false, width = 112, className = "" }: PlayingCardProps) {
  const pips = pipLayouts[rank];
  const isCourt = courtRanks.has(rank);

  return (
    <div
      className={`playing-card ${faceDown ? "is-face-down" : ""} ${redSuits.has(suit) ? "is-red" : ""} ${className}`.trim()}
      style={{ fontSize: width / 14, width }}
      aria-label={faceDown ? "Face-down card" : `${rank} of ${suit}`}
    >
      {faceDown ? (
        <div className="playing-card__back">
          <strong>BICYCLE<sup>®</sup></strong>
          <span aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <circle cx="18" cy="43" r="11" />
              <circle cx="47" cy="43" r="11" />
              <path d="M18 43 29 24l8 19H18l13-11h16M27 20h9M38 18l8 5" />
            </svg>
          </span>
          <small>RIDER BACK · 808</small>
        </div>
      ) : (
        <>
          <CornerIndex rank={rank} suit={suit} />
          <CornerIndex rank={rank} suit={suit} flipped />

          {rank === "A" ? (
            <div className="playing-card__ace"><SuitIcon suit={suit} /></div>
          ) : null}

          {isCourt ? (
            <div className="playing-card__court">
              <span>{rank}</span>
              <SuitIcon suit={suit} />
            </div>
          ) : null}

          {pips ? (
            <div className="playing-card__pips">
              {pips.map((pip) => (
                <span key={`${pip.x}-${pip.y}`} style={{ left: `${pip.x}%`, top: `${pip.y}%` }}>
                  <SuitIcon suit={suit} className={pip.flip ? "is-flipped" : ""} />
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
