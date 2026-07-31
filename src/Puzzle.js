import React, { useState, useEffect } from "react";
import "./Puzzle.css";
//import puzzleImg from "./images/puzzle-dog.jpg";
import { useNavigate } from "react-router-dom";

export const Puzzle = () => {

  const navigate = useNavigate();

  const [tiles, setTiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [image, setImage] = useState("");
  const [scores, setScores] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const size = 5; // 5x5 grid
  const totalTiles = size * size;

  const loadScores = () => {
  fetch("http://localhost:8080/api/scores/PUZZLE")
    .then(res => res.json())
    .then(data => {
      setScores(data);
      setShowScoreboard(true);
    });
};

  const checkWin = (tilesArray) => {
    for (let i = 0; i < tilesArray.length; i++) {
      if (tilesArray[i] !== i) {
        return false;
      }
    }
    return true;
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index) => {
    if (tiles[index] === index || tiles[draggedIndex] === draggedIndex) {
      return;
    }
    
    const newTiles = [...tiles];

    // swap
    [newTiles[draggedIndex], newTiles[index]] = [
      newTiles[index],
      newTiles[draggedIndex],
    ];

    setTiles(newTiles);
    setDraggedIndex(null);

    // ✅ win check
    if (checkWin(newTiles)) {
  setIsWin(true);

  fetch("http://localhost:8080/api/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      game: "PUZZLE",
      score: 50
    })
  });
}
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

  // Initialize tiles
  useEffect(() => {
    const numbers = Array.from({ length: totalTiles }, (_, i) => i);
    const shuffledTiles = shuffleArray(numbers);
    setTiles(shuffledTiles);

    // ✅ new image load
    setImage(`https://picsum.photos/400?random=${Math.random()}`);
  }, []);

  return (
    <div className="puzzle-container">
      <h2>Puzzle Game 🧩</h2>
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

      {isWin ? (
        <div>
          <h2>🎉 You Win!</h2>
          {/* <img src={puzzleImg} alt="Completed" width="400" /> */}
          <img src={image} alt="Completed" width="400" />
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${size}, 80px)`,
          }}
        >
          {tiles.map((tile, index) => {
            const row = Math.floor(tile / size);
            const col = tile % size;
            const isCorrect = tile === index;

            return (
              <div
                key={index}
                className="tile"
                draggable={!isCorrect}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                style={{
                  //backgroundImage: `url(${puzzleImg})`,
                  backgroundImage: `url(${image})`,
                  backgroundSize: `${size * 80}px ${size * 80}px`,
                  backgroundPosition: `-${col * 80}px -${row * 80}px`,
                  border: isCorrect ? "2px solid green" : "none",
                }}
              ></div>
            );
          })}
        </div>
      )}

    </div>
  );
};