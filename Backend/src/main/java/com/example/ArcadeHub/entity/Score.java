package com.example.ArcadeHub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String game;
    private int score;
    private LocalDateTime createdAt = LocalDateTime.now();

    // GETTERS & SETTERS
    public Long getId(){ return id; }
    public String getUsername(){ return username; }
    public void setUsername(String username){ this.username = username; }
    public String getGame(){ return game; }
    public void setGame(String game){ this.game = game; }
    public int getScore(){ return score; }
    public void setScore(int score){ this.score = score; }
    public LocalDateTime getCreatedAt(){ return createdAt; }
}