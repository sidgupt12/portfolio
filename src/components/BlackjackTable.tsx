import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FileText, Music2 } from "lucide-react";
import type { DeskMode } from "./ClassicDesk";
import { CardValue, PlayingCard, PlayingCardRank, PlayingCardSuit } from "./PlayingCard";
import { SiddhantWordmark } from "./SiddhantWordmark";
import "./BlackjackTable.css";

type GamePhase = "idle" | "dealing" | "player" | "dealer" | "done";
type ResultKind = "win" | "loss" | "push";

const ranks: readonly PlayingCardRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits: readonly PlayingCardSuit[] = ["clubs", "diamonds", "hearts", "spades"];
const chipValues = [10, 25, 50, 100] as const;

function shuffledDeck() {
  const deck = suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[target]] = [deck[target], deck[index]];
  }
  return deck;
}

function handValue(hand: readonly CardValue[]) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === "A") {
      value += 11;
      aces += 1;
    } else if (["J", "Q", "K"].includes(card.rank)) {
      value += 10;
    } else {
      value += Number(card.rank);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
}

function draw(deck: CardValue[]) {
  const card = deck.pop();
  if (!card) throw new Error("The deck is empty");
  return card;
}

function makeNoise(context: AudioContext, duration: number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

function playCardSlide(context: AudioContext, delay = 0) {
  const at = context.currentTime + delay;
  const source = context.createBufferSource();
  source.buffer = makeNoise(context, 0.14);
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(780, at);
  filter.frequency.exponentialRampToValueAtTime(1450, at + 0.12);
  filter.Q.setValueAtTime(0.7, at);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.001, at);
  gain.gain.linearRampToValueAtTime(0.09, at + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(at);
  source.stop(at + 0.15);

  const snap = context.createOscillator();
  const snapGain = context.createGain();
  snap.type = "triangle";
  snap.frequency.setValueAtTime(190, at + 0.09);
  snap.frequency.exponentialRampToValueAtTime(95, at + 0.13);
  snapGain.gain.setValueAtTime(0.001, at + 0.085);
  snapGain.gain.linearRampToValueAtTime(0.025, at + 0.095);
  snapGain.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
  snap.connect(snapGain).connect(context.destination);
  snap.start(at + 0.085);
  snap.stop(at + 0.145);
}

function playChipClack(context: AudioContext) {
  const now = context.currentTime;
  [0, 0.045].forEach((delay, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(index ? 740 : 520, now + delay);
    oscillator.frequency.exponentialRampToValueAtTime(index ? 310 : 240, now + delay + 0.045);
    gain.gain.setValueAtTime(0.045, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.055);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.06);
  });
}

export function BlackjackTable({ onNavigate }: { onNavigate?: (mode: DeskMode) => void }) {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [playerHand, setPlayerHand] = useState<CardValue[]>([]);
  const [dealerHand, setDealerHand] = useState<CardValue[]>([]);
  const [message, setMessage] = useState("THE TABLE IS OPEN");
  const [stats, setStats] = useState({ wins: 0, losses: 0, pushes: 0 });
  const [bankroll, setBankroll] = useState(500);
  const [selectedChips, setSelectedChips] = useState<number[]>([25]);
  const deckRef = useRef<CardValue[]>([]);
  const timersRef = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext>();
  const bet = selectedChips.reduce((total, value) => total + value, 0);

  const getAudioContext = () => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const settleRound = (player: CardValue[], dealer: CardValue[]) => {
    const playerTotal = handValue(player);
    const dealerTotal = handValue(dealer);
    let result: ResultKind;
    let nextMessage: string;

    if (playerTotal > 21) {
      result = "loss";
      nextMessage = `BUST · HOUSE WINS ${dealerTotal} TO ${playerTotal}`;
    } else if (dealerTotal > 21) {
      result = "win";
      nextMessage = `DEALER BUSTS · YOU WIN ${playerTotal} TO ${dealerTotal}`;
    } else if (playerTotal > dealerTotal) {
      result = "win";
      nextMessage = `YOU WIN · ${playerTotal} TO ${dealerTotal}`;
    } else if (playerTotal < dealerTotal) {
      result = "loss";
      nextMessage = `HOUSE WINS · ${dealerTotal} TO ${playerTotal}`;
    } else {
      result = "push";
      nextMessage = `PUSH · BOTH HOLD ${playerTotal}`;
    }

    setMessage(nextMessage);
    setPhase("done");
    setStats((current) => ({
      wins: current.wins + (result === "win" ? 1 : 0),
      losses: current.losses + (result === "loss" ? 1 : 0),
      pushes: current.pushes + (result === "push" ? 1 : 0),
    }));
    setBankroll((current) => current + (result === "win" ? bet * 2 : result === "push" ? bet : 0));
  };

  const runDealer = (player: CardValue[], startingDealer = dealerHand) => {
    setPhase("dealer");
    setMessage("DEALER IS PLAYING");

    const finalDealer = [...startingDealer];
    while (handValue(finalDealer) < 17) finalDealer.push(draw(deckRef.current));

    const additions = finalDealer.slice(startingDealer.length);
    additions.forEach((card, index) => {
      const timer = window.setTimeout(
        () => {
          playCardSlide(getAudioContext());
          setDealerHand((current) => [...current, card]);
        },
        500 * (index + 1),
      );
      timersRef.current.push(timer);
    });

    const settleTimer = window.setTimeout(
      () => {
        setDealerHand(finalDealer);
        settleRound(player, finalDealer);
      },
      500 * additions.length + 620,
    );
    timersRef.current.push(settleTimer);
  };

  const deal = () => {
    if (bankroll < chipValues[0] && bet === 0) {
      setBankroll(500);
      setSelectedChips([25]);
      setMessage("FRESH $500 BUY-IN · PLACE YOUR BET");
      return;
    }

    if (bet === 0) {
      setMessage("PLACE AT LEAST ONE CHIP");
      return;
    }

    if (bankroll < bet) {
      setBankroll(500);
      setSelectedChips([25]);
      setMessage("FRESH $500 BUY-IN · PLACE YOUR BET");
      return;
    }

    clearTimers();
    const deck = shuffledDeck();
    const player = [draw(deck), draw(deck)];
    const dealer = [draw(deck), draw(deck)];
    deckRef.current = deck;
    setPlayerHand([]);
    setDealerHand([]);
    setBankroll((current) => current - bet);
    setPhase("dealing");
    setMessage("CARDS IN THE AIR");
    const audio = getAudioContext();
    [0, 0.16, 0.32, 0.48].forEach((delay) => playCardSlide(audio, delay));

    const dealSteps = [
      window.setTimeout(() => setPlayerHand([player[0]]), 20),
      window.setTimeout(() => setDealerHand([dealer[0]]), 160),
      window.setTimeout(() => setPlayerHand(player), 320),
      window.setTimeout(() => setDealerHand(dealer), 480),
    ];
    timersRef.current.push(...dealSteps);

    const readyTimer = window.setTimeout(() => {
      setPhase("player");
      setMessage(handValue(player) === 21 ? "BLACKJACK · DEALER CHECKS" : "YOUR MOVE");

      if (handValue(player) === 21) {
        const timer = window.setTimeout(() => runDealer(player, dealer), 550);
        timersRef.current.push(timer);
      }
    }, 670);
    timersRef.current.push(readyTimer);
  };

  const hit = () => {
    if (phase !== "player") return;
    const nextHand = [...playerHand, draw(deckRef.current)];
    playCardSlide(getAudioContext());
    setPlayerHand(nextHand);
    const total = handValue(nextHand);

    if (total > 21) {
      setPhase("dealer");
      const timer = window.setTimeout(() => settleRound(nextHand, dealerHand), 450);
      timersRef.current.push(timer);
    } else if (total === 21) {
      runDealer(nextHand);
    } else {
      setMessage(`${total} · HIT OR STAND?`);
    }
  };

  const stand = () => {
    if (phase !== "player") return;
    runDealer(playerHand);
  };

  const chooseBet = (value: number) => {
    if (["dealing", "player", "dealer"].includes(phase) || bet + value > bankroll) return;
    playChipClack(getAudioContext());
    setSelectedChips((current) => [...current, value]);
    setMessage(`$${bet + value} ON THE BETTING CIRCLE`);
  };

  const undoChip = () => {
    if (["dealing", "player", "dealer"].includes(phase) || selectedChips.length === 0) return;
    playChipClack(getAudioContext());
    setSelectedChips((current) => current.slice(0, -1));
    setMessage("LAST CHIP RETURNED TO THE BANK");
  };

  const clearBet = () => {
    if (["dealing", "player", "dealer"].includes(phase) || selectedChips.length === 0) return;
    playChipClack(getAudioContext());
    setSelectedChips([]);
    setMessage("BETTING CIRCLE CLEARED");
  };

  const changeTable = (nextMode: DeskMode) => {
    clearTimers();
    const audio = audioContextRef.current;
    audioContextRef.current = undefined;
    if (audio) void audio.close();
    onNavigate?.(nextMode);
  };

  useEffect(
    () => () => {
      clearTimers();
      if (audioContextRef.current) void audioContextRef.current.close();
    },
    [],
  );

  const roundInProgress = ["dealing", "player", "dealer"].includes(phase);
  const hideDealerCard = phase === "dealing" || phase === "player";
  const dealerVisibleValue = hideDealerCard ? handValue(dealerHand.slice(0, 1)) : handValue(dealerHand);

  return (
    <main className="blackjack-room">
      <section className="blackjack-table" aria-label="Blackjack table">
        <header className="blackjack-header">
          <div>
            <span className="blackjack-header__eyebrow">TABLE № 21 · PRIVATE GAME</span>
            <SiddhantWordmark text="blackjack" />
            <small>DEALER STANDS ON 17 · STANDARD 52-CARD GAME</small>
          </div>
          <nav className="blackjack-casino-nav" aria-label="Change table">
            <b>LEAVE TABLE</b>
            <button type="button" onClick={() => changeTable("typewriter")}>
              <FileText aria-hidden="true" /><span>TYPEWRITER</span><small>PRINT CV</small>
            </button>
            <button type="button" onClick={() => changeTable("cassette")}>
              <Music2 aria-hidden="true" /><span>RECORD</span><small>PLAY MUSIC</small>
            </button>
          </nav>
          <dl>
            <div><dt>W</dt><dd>{stats.wins}</dd></div>
            <div><dt>L</dt><dd>{stats.losses}</dd></div>
            <div><dt>P</dt><dd>{stats.pushes}</dd></div>
          </dl>
        </header>

        <div className="blackjack-felt">
          <div className="blackjack-deck" aria-hidden="true">
            <span /><span /><span><b>BICYCLE</b><small>808</small></span>
          </div>

          <div className="blackjack-hand blackjack-hand--dealer">
            <div className="blackjack-hand__label">
              <span>DEALER</span>
              <strong>{dealerHand.length ? dealerVisibleValue : "—"}</strong>
            </div>
            <div className="blackjack-cards">
              {dealerHand.map((card, index) => (
                <PlayingCard
                  key={`${card.rank}-${card.suit}-${index}`}
                  {...card}
                  faceDown={hideDealerCard && index === 1}
                  width={88}
                />
              ))}
            </div>
          </div>

          <div className="blackjack-message" aria-live="polite">
            <i aria-hidden="true" />
            <span>{message}</span>
            <i aria-hidden="true" />
          </div>

          <div className="blackjack-betting">
            <div className="blackjack-bank">
              <span>CHIP BANK</span>
              <strong>${bankroll}</strong>
              <small>CLICK CHIPS TO ADD</small>
            </div>
            <div className="blackjack-bet-circle">
              <span>BETTING CIRCLE</span>
              <div className="blackjack-bet-stack" aria-label={`Current bet ${bet} dollars`}>
                {selectedChips.length ? selectedChips.slice(-10).map((value, index) => (
                  <i
                    key={`${value}-${index}`}
                    className={`blackjack-chip-piece blackjack-chip-piece--${value}`}
                    style={{ "--stack-index": index } as CSSProperties}
                  ><b>${value}</b></i>
                )) : <small>EMPTY</small>}
              </div>
              <strong>${bet}</strong>
              <div>
                <button type="button" onClick={undoChip} disabled={roundInProgress || !selectedChips.length}>UNDO</button>
                <button type="button" onClick={clearBet} disabled={roundInProgress || !selectedChips.length}>CLEAR</button>
              </div>
            </div>
            <div className="blackjack-chip-bank" aria-label="Choose chips from the bank">
              <span>ADD CHIP</span>
              <div className="blackjack-chip-rack">
                {chipValues.map((value) => {
                  const count = selectedChips.filter((chip) => chip === value).length;
                  return (
                    <button
                      type="button"
                      key={value}
                      className={`blackjack-chip blackjack-chip--${value} ${count ? "has-selected" : ""}`}
                      onClick={() => chooseBet(value)}
                      disabled={roundInProgress || bet + value > bankroll}
                      aria-label={`Add ${value} dollar chip`}
                      aria-pressed={count > 0}
                    >
                      <span>${value}</span>
                      {count ? <i>×{count}</i> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="blackjack-hand blackjack-hand--player">
            <div className="blackjack-cards">
              {playerHand.map((card, index) => (
                <PlayingCard key={`${card.rank}-${card.suit}-${index}`} {...card} width={94} />
              ))}
            </div>
            <div className="blackjack-hand__label">
              <span>PLAYER</span>
              <strong>{playerHand.length ? handValue(playerHand) : "—"}</strong>
            </div>
          </div>

          <div className="blackjack-actions">
            {phase === "idle" || phase === "done" ? (
              <button type="button" className="blackjack-actions__deal" onClick={deal}>
                {bankroll < bet || (bankroll < chipValues[0] && bet === 0)
                  ? "BUY IN $500"
                  : phase === "done"
                    ? `DEAL AGAIN · $${bet}`
                    : bet
                      ? `DEAL · $${bet}`
                      : "PLACE A BET"}
              </button>
            ) : (
              <>
                <button type="button" onClick={hit} disabled={phase !== "player"}>HIT</button>
                <button type="button" onClick={stand} disabled={phase !== "player"}>STAND</button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
