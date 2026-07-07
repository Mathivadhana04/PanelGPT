package com.panelgpt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "debate_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebateMessage {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    @Column(name = "persona_id", nullable = false, length = 50)
    private String personaId;

    @Column(name = "persona_name", nullable = false, length = 100)
    private String personaName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "response_order", nullable = false)
    private Integer responseOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
