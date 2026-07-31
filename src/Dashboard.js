import React from "react";
import "./Dashboard.css";

import uno from "./images/uno.png";
import puzzle from "./images/puzzle.png";
import memory from "./images/memory.png";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {

  const navigate = useNavigate();

  return (
    <div className="dashboard">
      
      <h1 className="title">🎮 ArcadeHub 🎮</h1>
      <p className="subtitle">Choose your game & start playing</p>

      <div className="game-container">

        <div className="game-card" onClick={() => navigate("/uno")}>
          <img src={uno} alt="UNO" />
          <div className="overlay">Play UNO</div>
          <p>UNO</p>
        </div>

        <div className="game-card" onClick={() => navigate("/puzzle")}>
          <img src={puzzle} alt="Puzzle" />
          <div className="overlay">Play Puzzle</div>
          <p>Puzzle Game</p>
        </div>

        <div className="game-card" onClick={() => navigate("/memory")}>
          <img src={memory} alt="Memory" />
          <div className="overlay">Play Memory</div>
          <p>Memory</p>
        </div>

      </div>
    </div>
  );
};