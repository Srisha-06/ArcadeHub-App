package com.example.ArcadeHub.controller;

import com.example.ArcadeHub.entity.Score;
import com.example.ArcadeHub.repository.ScoreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins="http://localhost:3000")
public class ScoreController {

    private final ScoreRepository repo;

    public ScoreController(ScoreRepository repo) {
        this.repo = repo;
    }

    // Save score
    @PostMapping
    public Score saveScore(@RequestBody Score score) {
        return repo.save(score);
    }

    // Get leaderboard by game
    @GetMapping("/{game}")
    public List<Score> getScores(@PathVariable String game) {
        return repo.findByGameOrderByScoreDesc(game);
    }
}