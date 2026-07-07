package com.panelgpt.repository;

import com.panelgpt.model.DebateSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DebateSessionRepository extends JpaRepository<DebateSession, String> {
    Page<DebateSession> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<DebateSession> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
    long countByUserIdAndCreatedAtAfter(String userId, LocalDateTime after);

    @Query("SELECT d.topic, COUNT(d) as cnt FROM DebateSession d WHERE d.userId = :userId GROUP BY d.topic ORDER BY cnt DESC")
    List<Object[]> findTopTopicByUserId(String userId, Pageable pageable);
}
