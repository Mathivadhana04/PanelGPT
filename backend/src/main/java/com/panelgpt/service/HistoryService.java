package com.panelgpt.service;

import com.panelgpt.dto.*;
import com.panelgpt.model.DebateMessage;
import com.panelgpt.model.DebateSession;
import com.panelgpt.repository.DebateMessageRepository;
import com.panelgpt.repository.DebateSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HistoryService {

    private final DebateSessionRepository sessionRepository;
    private final DebateMessageRepository messageRepository;

    @Transactional
    public DebateSessionDTO saveDebate(String userId, SaveDebateRequest request) {
        // De-duplication check: Skip inserting if the same user saved the same topic within the last 10 seconds
        List<DebateSession> recentSessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 1)).getContent();
        if (!recentSessions.isEmpty()) {
            DebateSession lastSession = recentSessions.get(0);
            if (lastSession.getTopic().equalsIgnoreCase(request.getTopic()) &&
                lastSession.getCreatedAt() != null &&
                lastSession.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(10))) {
                log.info("Duplicate save detected for user {} on topic '{}' within 10 seconds. Returning existing session.", userId, request.getTopic());
                List<DebateMessage> existingMessages = messageRepository.findBySessionIdOrderByResponseOrderAsc(lastSession.getId());
                return mapToDTO(lastSession, existingMessages);
            }
        }

        DebateSession session = DebateSession.builder()
                .userId(userId)
                .topic(request.getTopic())
                .status("completed")
                .durationSeconds(request.getDurationSeconds())
                .build();

        session = sessionRepository.save(session);

        final String sessionId = session.getId();
        List<DebateMessage> messages = request.getMessages().stream()
                .map(m -> DebateMessage.builder()
                        .sessionId(sessionId)
                        .personaId(m.getPersonaId())
                        .personaName(m.getPersonaName())
                        .content(m.getContent())
                        .responseOrder(m.getResponseOrder())
                        .build())
                .collect(Collectors.toList());

        messageRepository.saveAll(messages);
        log.info("Saved debate session {} for user {} — {} messages", sessionId, userId, messages.size());

        return mapToDTO(session, messages);
    }

    public Page<DebateSessionDTO> getUserDebates(String userId, int page, int size) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(s -> mapToDTO(s, null));
    }

    public DebateSessionDTO getDebateById(String sessionId, String userId) {
        DebateSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("Debate not found"));
        List<DebateMessage> messages = messageRepository.findBySessionIdOrderByResponseOrderAsc(sessionId);
        return mapToDTO(session, messages);
    }

    @Transactional
    public void deleteDebate(String sessionId, String userId) {
        DebateSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("Debate not found"));
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.delete(session);
        log.info("Deleted debate session {}", sessionId);
    }

    public UserStatsDTO getUserStats(String userId) {
        long total = sessionRepository.countByUserId(userId);
        long thisWeek = sessionRepository.countByUserIdAndCreatedAtAfter(
                userId, LocalDateTime.now().minusDays(7));

        String topTopic = sessionRepository
                .findTopTopicByUserId(userId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(r -> (String) r[0])
                .orElse("N/A");

        return UserStatsDTO.builder()
                .totalDebates(total)
                .debatesThisWeek(thisWeek)
                .topTopic(topTopic)
                .totalPersonasUsed(total * 6)
                .build();
    }

    private DebateSessionDTO mapToDTO(DebateSession session, List<DebateMessage> messages) {
        List<DebateMessageDTO> messageDTOs = null;
        if (messages != null) {
            messageDTOs = messages.stream()
                    .map(m -> DebateMessageDTO.builder()
                            .id(m.getId())
                            .personaId(m.getPersonaId())
                            .personaName(m.getPersonaName())
                            .personaColor(getPersonaColor(m.getPersonaId()))
                            .content(m.getContent())
                            .responseOrder(m.getResponseOrder())
                            .createdAt(m.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        return DebateSessionDTO.builder()
                .id(session.getId())
                .topic(session.getTopic())
                .status(session.getStatus())
                .durationSeconds(session.getDurationSeconds())
                .createdAt(session.getCreatedAt())
                .messageCount(messages != null ? messages.size() : 0)
                .messages(messageDTOs)
                .build();
    }

    private String getPersonaColor(String personaId) {
        OllamaService.PersonaConfig config = OllamaService.PERSONAS.get(personaId);
        return config != null ? config.color() : "#6366F1";
    }
}
