import React, { useState, useEffect } from "react";
import "./Memory.css";
import { useNavigate } from "react-router-dom";

export const Memory = () => {

    const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [scores, setScores] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const loadScores = () => {
  fetch("http://localhost:8080/api/scores/MEMORY")
    .then(res => res.json())
    .then(data => {
      setScores(data);
      setShowScoreboard(true);
    });
};

  // Shuffle function
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateImagePairs = () => {
  let images = [];

  for (let i = 0; i < 8; i++) {   // ✅ 8 pairs = 16 cards
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/seed/${randomId}/100`;

    images.push(url);
    images.push(url);
  }

  return shuffleArray(images);
};

  // ✅ STEP 1 – Initialize cards
  useEffect(() => {
    const shuffledImages = generateImagePairs();

    const formattedCards = shuffledImages.map((img, index) => ({
        id: index,
        value: img,
        isFlipped: false,
        isMatched: false,
    }));

    setCards(formattedCards);
}, []);

  // ✅ STEP 2 – Handle click
  const handleCardClick = (index) => {
    const newCards = [...cards];

    if (
      newCards[index].isFlipped ||
      newCards[index].isMatched ||
      selectedCards.length === 2
    ) {
      return;
    }

    newCards[index].isFlipped = true;

    setCards(newCards);
    setSelectedCards([...selectedCards, index]);
  };

  // ✅ STEP 3 – Match logic
  useEffect(() => {
    if (selectedCards.length === 2 && cards.length) {
      const [first, second] = selectedCards;

      if (cards[first].value === cards[second].value) {
        // ✅ Match
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;

        setCards(newCards);
        setSelectedCards([]);

        const allMatched = newCards.every(card => card.isMatched);

        if (allMatched) {
  setIsWin(true);

  fetch("http://localhost:8080/api/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      game: "MEMORY",
      score: 70
    })
  });
}
      } else {
        // ❌ Not match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;

          setCards(newCards);
          setSelectedCards([]);
        }, 800);
      }
    }
  }, [selectedCards, cards]);

  return (
    <div className="memory-container">
      <h2>Memory Game 🧠</h2>
      <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      <button onClick={loadScores}>🏆 View Scoreboard</button>

      {showScoreboard && (
  <div className="scoreboard">
    <h3>✨Leaderboard✨</h3>

    {scores.length === 0 ? (
      <p>No scores yet</p>
    ) : (
      scores.slice(0, 5).map((s, i) => (
        <p key={i}>
          {i + 1}. {s.username} - {s.score}
        </p>
      ))
    )}

    <button onClick={() => setShowScoreboard(false)}>
      Close
    </button>
  </div>
)}

      {isWin && <h2>🎉 You Win!</h2>}

      <div className="memory-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className="card"
            onClick={() => handleCardClick(card.id)}
          >
            {card.isFlipped || card.isMatched ? (
                <img src={card.value} alt="" width="60" />
                ) : (
                "?"
            )}
          </div>
        ))}
      </div>
    </div>
  );
};