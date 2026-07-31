import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Uno.css';

/* ============================================================
   CONSTANTS
   ============================================================ */
const COLORS = ['red', 'yellow', 'green', 'blue'];
const DEAL_STAGGER = 65; // ms between each dealt card
const DEAL_CARD_DURATION = 480; // ms flight time of a single dealt card

/* ============================================================
   DECK CREATION
   ============================================================ */
function createDeck() {
  const deck = [];
  let id = 0;

  COLORS.forEach((color) => {
    deck.push({ id: id++, color, type: 'number', value: '0' });
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: id++, color, type: 'number', value: String(n) });
      deck.push({ id: id++, color, type: 'number', value: String(n) });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ id: id++, color, type: 'skip', value: 'skip' });
      deck.push({ id: id++, color, type: 'reverse', value: 'reverse' });
      deck.push({ id: id++, color, type: 'draw2', value: 'draw2' });
    }
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'wild', type: 'wild', value: 'wild' });
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'wild', type: 'wild4', value: 'wild4' });
  }

  return deck;
}

function shuffle(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================================
   PURE GAME HELPERS
   ============================================================ */
function isValidCard(card, topCard, currentColor) {
  if (!topCard) return true;
  if (card.type === 'wild' || card.type === 'wild4') return true;
  if (card.color === currentColor) return true;
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
    return true;
  }
  if (card.type !== 'number' && card.type === topCard.type) return true;
  return false;
}

function getNextIndex(current, dir, count, steps) {
  let idx = current;
  for (let i = 0; i < steps; i++) {
    idx = (idx + dir + count) % count;
  }
  return idx;
}

function drawCardsFromPile(drawPile, discardPile, count) {
  let d = [...drawPile];
  let disc = [...discardPile];
  const drawn = [];

  for (let i = 0; i < count; i++) {
    if (d.length === 0) {
      if (disc.length <= 1) break;
      const top = disc[disc.length - 1];
      const rest = shuffle(disc.slice(0, disc.length - 1));
      d = rest;
      disc = [top];
    }
    if (d.length === 0) break;
    drawn.push(d.pop());
  }

  return { draw: d, discard: disc, drawn };
}

function cardLabel(card) {
  switch (card.type) {
    case 'number':
      return card.value;
    case 'skip':
      return '⊘';
    case 'reverse':
      return '⇄';
    case 'draw2':
      return '+2';
    case 'wild':
      return 'WILD';
    case 'wild4':
      return '+4';
    default:
      return '';
  }
}

function colorHex(color) {
  switch (color) {
    case 'red':
      return '#e63946';
    case 'yellow':
      return '#f4d35e';
    case 'green':
      return '#2a9d8f';
    case 'blue':
      return '#457b9d';
    default:
      return '#333333';
  }
}

// Deterministic pseudo-random offset/rotation for the discard stack, based on card id
function stackTransform(cardId) {
  const rot = ((cardId * 53) % 21) - 10;
  const dx = ((cardId * 17) % 13) - 6;
  return `translate(${dx}px, 0px) rotate(${rot}deg)`;
}

// Target offset (px) for a card flying out during the deal animation
function dealTargetOffset(playerIndex, totalPlayers) {
  if (playerIndex === 0) {
    return { x: 0, y: 250 };
  }
  const others = totalPlayers - 1;
  const slot = playerIndex - 1;
  const spread = 320;
  const x = others <= 1 ? 0 : -spread / 2 + (spread / (others - 1 || 1)) * slot;
  return { x, y: -230 };
}

/* ============================================================
   CARD COMPONENT
   ============================================================ */
function Card({ card, faceDown }) {
  if (faceDown) {
    return (
      <div className="card back">
        <span className="card-back-logo">UNO</span>
      </div>
    );
  }
  const colorClass = card.color === 'wild' ? 'wild' : card.color;
  return (
    <div className={`card ${colorClass}`}>
      <span className="card-corner top-left">{cardLabel(card)}</span>
      <span className="card-label">{cardLabel(card)}</span>
      <span className="card-corner bottom-right">{cardLabel(card)}</span>
    </div>
  );
}

/* ============================================================
   PLAYER SELECT SCREEN
   ============================================================ */
function PlayerSelect({ onSelect }) {

  const [numPlayers, setNumPlayers] = useState(null);
  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const handleNumberSelect = (n) => {
    setNumPlayers(n);
    setNames(Array(n).fill(""));
  };

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const startGame = () => {
    onSelect(numPlayers, names);
  };

  const loadScores = () => {
    fetch("http://localhost:8080/api/scores/UNO")
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setShowScoreboard(true);
      });
  };

  return (
    <div className="player-select-screen screen-fade">
      <h1 className="uno-logo">UNO</h1>

      {!numPlayers ? (
        <>
          <h2>Select Number of Players</h2>
          <div className="player-options">
            {[2,3,4,5,6].map(n => (
              <button key={n} onClick={() => handleNumberSelect(n)}>
                {n}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2>Enter Player Names</h2>
          {names.map((name, i) => (
            <input
              key={i}
              placeholder={`Player ${i+1} name`}
              value={name}
              onChange={(e) => handleNameChange(i, e.target.value)}
            />
          ))}

          <button onClick={startGame}>Start Game</button>
        </>
      )}

      <br/><br/>
      <button className="score-btn" onClick={loadScores}>🏆 View Scoreboard</button>

      {showScoreboard && (
        <div className="scoreboard">
          <h3>✨Leaderboard✨</h3>
          {scores.length === 0 ? (
      <p>No scores yet</p>
    ) : (
          scores.map((s, i) => (
            <p key={i}>{i+1}. {s.username} - {s.score}</p>
          )))}
          <button className="score-btn" onClick={() => setShowScoreboard(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN GAME COMPONENT (named export)
   ============================================================ */
export function Uno() {
  const [phase, setPhase] = useState('select'); // select | dealing | playing | winner
  const [playerCount, setPlayerCount] = useState(null);
  const [playerNames, setPlayerNames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [direction, setDirection] = useState(1);
  const [currentColor, setCurrentColor] = useState(null);
  const [message, setMessage] = useState('');
  const [choosingColor, setChoosingColor] = useState(false);
  const [pendingCard, setPendingCard] = useState(null);
  const [winner, setWinner] = useState(null);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false); // strict card privacy toggle
  const [scores, setScores] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const pendingGameRef = useRef(null);

  // Auto-clear transient "invalid move" messages
  useEffect(() => {
    if (message && message.startsWith('Invalid')) {
      const t = setTimeout(() => {
        setMessage((prev) => (prev.startsWith('Invalid') ? '' : prev));
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [message]);

  // CARD PRIVACY: whenever the turn changes, force the new current player's
  // cards to be hidden again until they explicitly choose to view them.
  useEffect(() => {
    setIsCardVisible(false);
  }, [currentPlayer]);

  /* -------------------- DEAL SEQUENCE (for animation only) -------------------- */
  const dealSequence = useMemo(() => {
    if (phase !== 'dealing' || !playerCount) return [];
    const seq = [];
    for (let round = 0; round < 7; round++) {
      for (let p = 0; p < playerCount; p++) {
        seq.push({ playerIndex: p, key: `${round}-${p}` });
      }
    }
    return seq;
  }, [phase, playerCount]);

  // Reveal the actual table once the dealing animation has finished playing
  useEffect(() => {
    if (phase !== 'dealing' || !playerCount || dealSequence.length === 0) return;
    const totalTime = dealSequence.length * DEAL_STAGGER + DEAL_CARD_DURATION + 250;
    const t = setTimeout(() => {
      const data = pendingGameRef.current;
      if (!data) return;
      setPlayers(data.players);
      setDrawPile(data.drawPile);
      setDiscardPile(data.discardPile);
      setCurrentColor(data.currentColor);
      setCurrentPlayer(0);
      setDirection(1);
      setWinner(null);
      setIsCardVisible(false);
      setMessage(`${playerNames[0]}'s Turn`);
      setPhase('playing');
    }, totalTime);
    return () => clearTimeout(t);
  }, [phase, playerCount, dealSequence]);

  /* -------------------- GAME SETUP -------------------- */
  function startGame(num, names) {
    setPlayerNames(names);
    const deck = shuffle(createDeck());
    let d = [...deck];
    const newPlayers = [];

    for (let i = 0; i < num; i++) {
      newPlayers.push({ hand: d.splice(0, 7) });
    }

    let startCard = d.pop();
    while (startCard.type === 'wild4') {
      d.unshift(startCard);
      d = shuffle(d);
      startCard = d.pop();
    }

    let startColor = startCard.color;
    if (startCard.type === 'wild') {
      startColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    pendingGameRef.current = {
      players: newPlayers,
      drawPile: d,
      discardPile: [startCard],
      currentColor: startColor,
    };

    setPlayerCount(num);
    setChoosingColor(false);
    setPendingCard(null);
    setAnimatingIndex(null);
    setIsDrawing(false);
    setIsCardVisible(false);
    setPhase('dealing');
  }

  function resetGame() {
    setPhase('select');
    setPlayerCount(null);
    setPlayers([]);
    setDrawPile([]);
    setDiscardPile([]);
    setCurrentPlayer(0);
    setDirection(1);
    setCurrentColor(null);
    setMessage('');
    setChoosingColor(false);
    setPendingCard(null);
    setWinner(null);
    setAnimatingIndex(null);
    setIsDrawing(false);
    setIsCardVisible(false);
    pendingGameRef.current = null;
  }

  /* -------------------- CARD EFFECT RESOLUTION -------------------- */
  function resolveCardEffect(card, chosenColor, playersAfterPlay, discardAfterPlay, drawPileCurrent, playerWhoPlayed) {
    let dir = direction;
    let steps = 1;
    let dPile = drawPileCurrent;
    let disc = discardAfterPlay;
    let newPlayers = playersAfterPlay;
    let msg = '';

    if (card.type === 'reverse') {
      dir = -dir;
      steps = playerCount === 2 ? 2 : 1;
      msg = 'Reverse!';
    } else if (card.type === 'skip') {
      steps = 2;
      msg = 'Skip!';
    } else if (card.type === 'draw2') {
      const targetIdx = getNextIndex(playerWhoPlayed, dir, playerCount, 1);
      const res = drawCardsFromPile(dPile, disc, 2);
      newPlayers = newPlayers.map((p, i) =>
        i === targetIdx ? { ...p, hand: [...p.hand, ...res.drawn] } : p
      );
      dPile = res.draw;
      disc = res.discard;
      steps = 2;
      msg = `Draw 2! Player ${targetIdx + 1} draws 2 cards.`;
    } else if (card.type === 'wild4') {
      const targetIdx = getNextIndex(playerWhoPlayed, dir, playerCount, 1);
      const res = drawCardsFromPile(dPile, disc, 4);
      newPlayers = newPlayers.map((p, i) =>
        i === targetIdx ? { ...p, hand: [...p.hand, ...res.drawn] } : p
      );
      dPile = res.draw;
      disc = res.discard;
      steps = 2;
      msg = `Draw 4! Player ${targetIdx + 1} draws 4 cards.`;
    } else if (card.type === 'wild') {
      steps = 1;
      msg = 'Wild card played!';
    } else {
      steps = 1;
    }

    const nextIdx = getNextIndex(playerWhoPlayed, dir, playerCount, steps);
    const unoMsg = newPlayers[playerWhoPlayed].hand.length === 1 ? ' UNO!' : '';

    setPlayers(newPlayers);
    setDiscardPile(disc);
    setDrawPile(dPile);
    setDirection(dir);
    setCurrentColor(chosenColor);
    setCurrentPlayer(nextIdx);
    setMessage(`${msg}${unoMsg} ${playerNames[nextIdx]}'s Turn`);
  }

  /* -------------------- PLAY CARD (click -> animate -> commit) -------------------- */
  function handleCardClick(cardIndex) {
    if (!isCardVisible) return; // cards must be revealed before they can be played
    if (winner !== null || choosingColor || animatingIndex !== null || isDrawing) return;
    const player = players[currentPlayer];
    const card = player.hand[cardIndex];
    const top = discardPile[discardPile.length - 1];

    if (!isValidCard(card, top, currentColor)) {
      setMessage('Invalid move! That card cannot be played.');
      return;
    }
    setAnimatingIndex(cardIndex);
  }

  function handlePlayAnimationEnd(cardIndex) {
    if (animatingIndex !== cardIndex) return;
    setAnimatingIndex(null);
    commitPlayCard(cardIndex);
  }

  function commitPlayCard(cardIndex) {
    const player = players[currentPlayer];
    const card = player.hand[cardIndex];
    const newHand = player.hand.filter((_, i) => i !== cardIndex);
    const newPlayers = players.map((p, i) =>
      i === currentPlayer ? { ...p, hand: newHand } : p
    );
    const newDiscard = [...discardPile, card];

    if (newHand.length === 0) {

  // ✅ SAVE SCORE
  fetch("http://localhost:8080/api/scores", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: playerNames[currentPlayer],
    game: "UNO",
    score: 100
  })
});

  setPlayers(newPlayers);
  setDiscardPile(newDiscard);
  setWinner(currentPlayer);
setMessage(`${playerNames[currentPlayer]} Wins! 🎉`); 
setPhase('winner');
  return;
}

    if (card.type === 'wild' || card.type === 'wild4') {
      setPlayers(newPlayers);
      setDiscardPile(newDiscard);
      setPendingCard({ card, playerWhoPlayed: currentPlayer });
      setChoosingColor(true);
      return;
    }

    resolveCardEffect(card, card.color, newPlayers, newDiscard, drawPile, currentPlayer);
  }

  function confirmColor(color) {
    if (!pendingCard) return;
    setChoosingColor(false);
    resolveCardEffect(
      pendingCard.card,
      color,
      players,
      discardPile,
      drawPile,
      pendingCard.playerWhoPlayed
    );
    setPendingCard(null);
  }

  /* -------------------- DRAW CARD (click -> animate -> commit) -------------------- */
  function handleDrawClick() {
    if (winner !== null || choosingColor || isDrawing || animatingIndex !== null) return;
    setIsDrawing(true);
  }

  function handleDrawAnimationEnd() {
    setIsDrawing(false);
    commitDraw();
  }

  function commitDraw() {
    const res = drawCardsFromPile(drawPile, discardPile, 1);
    const newPlayers = players.map((p, i) =>
      i === currentPlayer ? { ...p, hand: [...p.hand, ...res.drawn] } : p
    );
    const nextIdx = getNextIndex(currentPlayer, direction, playerCount, 1);

    setPlayers(newPlayers);
    setDrawPile(res.draw);
    setDiscardPile(res.discard);
    setCurrentPlayer(nextIdx);
    setMessage(`${playerNames[currentPlayer]} drew a card. ${playerNames[nextIdx]}'s Turn`);
  }

  /* -------------------- RENDER: SELECT SCREEN -------------------- */
  if (phase === 'select') {
    return (
      <div className="uno-app">
        <PlayerSelect onSelect={startGame} />
      </div>
    );
  }

  /* -------------------- RENDER: WINNER SCREEN -------------------- */
  if (phase === 'winner' && winner !== null) {
    return (
      <div className="uno-app">
        <div className="winner-screen screen-fade">
          <h1>🎉 {playerNames[winner]} Wins! 🎉</h1>
          <button className="restart-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- RENDER: TABLE (dealing + playing) -------------------- */
  const topCard = discardPile[discardPile.length - 1];
  const activePlayer = players[currentPlayer];
  const stackCards = discardPile.slice(-3);

  return (
    <div className="uno-app">
      <div className="uno-board table-enter">
        {phase === 'playing' && activePlayer && (
          <>
            <div className="opponents">
              {players.map((p, i) =>
                i === currentPlayer ? null : (
                  <div key={i} className="opponent">
                    <div className="opponent-name">Player {i + 1}</div>
                    <div className="card-back-stack">
                      {Array.from({ length: Math.min(p.hand.length, 7) }).map((_, ci) => (
                        <div key={ci} className="mini-card-back" />
                      ))}
                    </div>
                    <div className="card-count">
                      {p.hand.length} card{p.hand.length !== 1 ? 's' : ''}
                      {p.hand.length === 1 && <span className="uno-badge">UNO!</span>}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="center-area">
              <div
                className={`pile draw-pile ${isDrawing ? 'disabled-pile' : ''}`}
                onClick={handleDrawClick}
                title="Draw a card"
              >
                <Card faceDown />
                <div className="pile-count">{drawPile.length} left</div>
                {isDrawing && (
                  <div className="draw-flight" onAnimationEnd={handleDrawAnimationEnd}>
                    <Card faceDown />
                  </div>
                )}
              </div>

              <div className="pile discard-pile">
                {stackCards.map((c, i) => {
                  const isTop = i === stackCards.length - 1;
                  return (
                    <div
                      key={c.id}
                      className={`discard-card-wrap ${isTop ? 'discard-top' : ''}`}
                      style={{ transform: stackTransform(c.id), zIndex: i }}
                    >
                      <Card card={c} />
                    </div>
                  );
                })}
              </div>

              <div
                className="current-color-indicator"
                style={{ backgroundColor: colorHex(currentColor) }}
              >
                Color: {currentColor ? currentColor.toUpperCase() : '-'}
              </div>
            </div>

            <div className="message-bar">{message}</div>

            <div className="current-player-area active-glow">
              <div className="current-player-label">
                Player {currentPlayer + 1}'s Turn
                {activePlayer.hand.length === 1 && <span className="uno-badge">UNO!</span>}
              </div>

              {/* CARD PRIVACY: hidden by default, revealed only on demand */}
              {!isCardVisible && (
                <div className="hidden-hand">
                  <div className="card-back-stack large">
                    {Array.from({ length: Math.min(activePlayer.hand.length, 7) }).map((_, ci) => (
                      <div key={ci} className="mini-card-back large" />
                    ))}
                  </div>
                  <div className="card-count">
                    {activePlayer.hand.length} card{activePlayer.hand.length !== 1 ? 's' : ''}
                  </div>
                  <button
                    className="see-cards-btn"
                    onClick={() => setIsCardVisible(true)}
                  >
                    👉 See My Cards
                  </button>
                </div>
              )}

              {isCardVisible && (
                <>
                  <div className="hand">
                    {activePlayer.hand.map((card, idx) => {
                      const valid = isValidCard(card, topCard, currentColor);
                      const isAnimatingOut = animatingIndex === idx;
                      return (
                        <div
                          key={card.id}
                          className={`hand-card ${valid ? 'playable' : 'not-playable'} ${
                            isAnimatingOut ? 'playing-out' : ''
                          }`}
                          onClick={() => handleCardClick(idx)}
                          onAnimationEnd={() => isAnimatingOut && handlePlayAnimationEnd(idx)}
                        >
                          <Card card={card} />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="hide-cards-btn"
                    onClick={() => setIsCardVisible(false)}
                  >
                    Hide My Cards
                  </button>
                </>
              )}

              <button
                className={`draw-btn ${isDrawing ? 'disabled-btn' : ''}`}
                onClick={handleDrawClick}
              >
                Draw Card
              </button>
            </div>

            {choosingColor && (
              <div className="color-modal-overlay">
                <div className="color-modal screen-fade">
                  <h3>Choose a Color</h3>
                  <div className="color-options">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        className={`color-btn ${c}`}
                        onClick={() => confirmColor(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {phase === 'dealing' && (
          <div className="dealing-overlay">
            <div className="deal-source">
              <Card faceDown />
            </div>
            {dealSequence.map((item, i) => {
              const { x, y } = dealTargetOffset(item.playerIndex, playerCount);
              return (
                <div
                  key={item.key}
                  className="dealt-card"
                  style={{
                    '--tx': `${x}px`,
                    '--ty': `${y}px`,
                    animationDelay: `${i * DEAL_STAGGER}ms`,
                  }}
                >
                  <Card faceDown />
                </div>
              );
            })}
            <div className="dealing-label">Dealing cards...</div>
          </div>
        )}
      </div>
    </div>
  );
}