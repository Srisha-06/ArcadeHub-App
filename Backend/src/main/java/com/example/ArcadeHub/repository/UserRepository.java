package com.example.ArcadeHub.repository;

import com.example.ArcadeHub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
