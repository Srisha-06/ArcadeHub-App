import React, { useEffect, useState } from "react";

export const Scoreboard = () => {

  const [game, setGame] = useState("UNO");
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/scores/${game}`)
      .then(res => res.json())
      .then(data => setScores(data));
  }, [game]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏆 Scoreboard</h2>

      <select onChange={(e) => setGame(e.target.value)}>
        <option>UNO</option>
        <option>Puzzle</option>
        <option>Memory</option>
      </select>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {scores.map((s, i) => (
            <tr key={s.id}>
              <td>{i + 1}</td>
              <td>{s.username}</td>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};