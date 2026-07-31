package com.example.ArcadeHub.repository;

import com.example.ArcadeHub.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findByGameOrderByScoreDesc(String game);
}