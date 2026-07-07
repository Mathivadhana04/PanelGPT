package com.panelgpt.repository;

import com.panelgpt.model.DebateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebateMessageRepository extends JpaRepository<DebateMessage, String> {
    List<DebateMessage> findBySessionIdOrderByResponseOrderAsc(String sessionId);
    void deleteBySessionId(String sessionId);
}
