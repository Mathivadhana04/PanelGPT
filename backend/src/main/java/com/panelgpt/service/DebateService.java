package com.panelgpt.service;

import com.panelgpt.dto.DebateMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DebateService {

    private final OllamaService ollamaService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper =
            new com.fasterxml.jackson.databind.ObjectMapper()
                .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private final ExecutorService executor = Executors.newCachedThreadPool();

    // Map to track active debate sessions for each user to support explicit stopping
    private final Map<String, DebateSessionTracker> activeSessions = new ConcurrentHashMap<>();

    public static class DebateSessionTracker {
        public final AtomicBoolean stopped;
        public final List<Future<Void>> activeFutures;

        public DebateSessionTracker(AtomicBoolean stopped, List<Future<Void>> activeFutures) {
            this.stopped = stopped;
            this.activeFutures = activeFutures;
        }
    }

    public void stopDebate(String userId) {
        DebateSessionTracker tracker = activeSessions.remove(userId);
        if (tracker != null) {
            tracker.stopped.set(true);
            log.info("Explicit stop request received on backend for user: {}", userId);
            for (Future<Void> f : tracker.activeFutures) {
                if (f != null && !f.isDone()) {
                    f.cancel(true);
                }
            }
        }
    }

    /**
     * Generates one round of debate (all 6 personas in parallel) and returns a plain list.
     * Used by the polling-based frontend instead of SSE streaming.
     */
    public List<DebateMessageDTO> generateRound(String topic, int round) {
        List<String> personaIds = new ArrayList<>(OllamaService.PERSONAS.keySet());
        List<DebateMessageDTO> results = new CopyOnWriteArrayList<>();
        AtomicInteger order = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = personaIds.stream().map(personaId ->
            CompletableFuture.runAsync(() -> {
                OllamaService.PersonaConfig persona = OllamaService.PERSONAS.get(personaId);
                String content;
                try {
                    content = ollamaService.generateResponse(personaId, topic, round);
                } catch (Exception e) {
                    log.warn("Persona {} failed in round {}: {}", personaId, round, e.getMessage());
                    content = "(thinking...)";
                }
                results.add(DebateMessageDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .personaId(personaId)
                    .personaName(persona.name())
                    .personaColor(persona.color())
                    .content(content)
                    .responseOrder(order.getAndIncrement())
                    .createdAt(LocalDateTime.now())
                    .build());
            }, executor)
        ).collect(Collectors.toList());

        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .get(90, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            log.warn("Round {} timed out after 90s, returning partial results", round);
        } catch (Exception e) {
            log.error("Round {} execution error: {}", round, e.getMessage());
        }

        return results.stream()
            .sorted(Comparator.comparingInt(DebateMessageDTO::getResponseOrder))
            .collect(Collectors.toList());
    }

    /**
     * Streams debate facts INDEFINITELY — one round = all 6 personas fire in parallel.
     * Rounds keep repeating until the SSE client disconnects (user clicks Stop).
     */
    public SseEmitter streamDebate(String topic, String userId) {
        // Very long timeout — debate runs until user stops it
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        AtomicBoolean stopped = new AtomicBoolean(false);
        List<Future<Void>> activeFutures = new CopyOnWriteArrayList<>();
        List<String> personaIds = new ArrayList<>(OllamaService.PERSONAS.keySet());

        // Stop any currently running debate for this user first
        stopDebate(userId);

        // Register the new tracker
        activeSessions.put(userId, new DebateSessionTracker(stopped, activeFutures));

        Runnable cleanup = () -> {
            if (stopped.compareAndSet(false, true)) {
                log.info("Stopping debate stream for topic: {}", topic);
                activeSessions.remove(userId);
                for (Future<Void> f : activeFutures) {
                    if (f != null && !f.isDone()) {
                        f.cancel(true); // Interrupt thread immediately!
                    }
                }
            }
        };

        emitter.onTimeout(() -> {
            cleanup.run();
            emitter.complete();
        });
        emitter.onError(e -> cleanup.run());
        emitter.onCompletion(cleanup);

        // ── Send DEBATE_START synchronously so Render proxy sees data immediately ──
        // (if sent inside executor thread, nginx may close the "empty" stream first)
        try {
            sendEvent(emitter, "DEBATE_START", Map.of(
                "topic", topic,
                "totalPersonas", personaIds.size(),
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (IOException e) {
            log.warn("Could not send DEBATE_START event: {}", e.getMessage());
            emitter.complete();
            return emitter;
        }

        executor.submit(() -> {
            AtomicInteger totalMessages = new AtomicInteger(0);
            int round = 0;

            try {
                // ── Infinite rounds loop ──────────────────────────────────────
                while (!stopped.get()) {
                    round++;
                    final int currentRound = round;
                    log.info("=== Round {} starting for topic: '{}' ===", currentRound, topic);

                    // Fire ALL 6 personas in parallel for this round
                    activeFutures.clear();

                    for (int i = 0; i < personaIds.size(); i++) {
                        final String personaId = personaIds.get(i);
                        // Small stagger so typing indicators appear sequentially on the UI
                        final int staggerMs = i * 200;

                        Future<Void> fut = executor.submit(() -> {
                            if (stopped.get()) return null;
                            OllamaService.PersonaConfig persona = OllamaService.PERSONAS.get(personaId);

                            try {
                                // Stagger typing indicator appearance only
                                if (staggerMs > 0) Thread.sleep(staggerMs);

                                if (stopped.get()) return null;

                                // Send typing indicator
                                sendEvent(emitter, "PERSONA_TYPING", Map.of(
                                    "personaId", personaId,
                                    "personaName", persona.name(),
                                    "personaColor", persona.color()
                                ));

                                // Generate one fact for this round
                                String fact = ollamaService.generateResponse(personaId, topic, currentRound);

                                if (stopped.get()) return null;

                                // Send the fact as a debate message
                                sendEvent(emitter, "DEBATE_MESSAGE", DebateMessageDTO.builder()
                                    .id(UUID.randomUUID().toString())
                                    .personaId(personaId)
                                    .personaName(persona.name())
                                    .personaColor(persona.color())
                                    .content(fact)
                                    .responseOrder(totalMessages.getAndIncrement())
                                    .createdAt(LocalDateTime.now())
                                    .build());

                            } catch (IOException e) {
                                // Client disconnected — signal stop
                                stopped.set(true);
                                log.info("Client disconnected during round {} ({})", currentRound, personaId);
                            } catch (Exception e) {
                                log.warn("Persona {} failed in round {}: {}", personaId, currentRound, e.getMessage());
                                if (!stopped.get()) {
                                    try {
                                        sendEvent(emitter, "DEBATE_MESSAGE", DebateMessageDTO.builder()
                                            .id(UUID.randomUUID().toString())
                                            .personaId(personaId)
                                            .personaName(persona.name())
                                            .personaColor(persona.color())
                                            .content("(thinking...)")
                                            .responseOrder(totalMessages.getAndIncrement())
                                            .createdAt(LocalDateTime.now())
                                            .build());
                                    } catch (Exception ignored) {}
                                }
                            }
                            return null;
                        });
                        activeFutures.add(fut);
                    }

                    // Wait for all personas in this round to finish
                    for (Future<Void> f : activeFutures) {
                        try {
                            f.get(85, TimeUnit.SECONDS);
                        } catch (TimeoutException e) {
                            log.warn("Round {} persona timed out", currentRound);
                            f.cancel(true);
                        } catch (ExecutionException e) {
                            log.warn("Round {} execution error: {}", currentRound, e.getCause().getMessage());
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            stopped.set(true);
                            break;
                        }
                    }

                    if (stopped.get()) break;

                    // Brief pause between rounds (300ms) to let frontend breathe
                    Thread.sleep(300);

                    // Send SSE keepalive comment to prevent proxy idle timeout
                    try {
                        emitter.send(SseEmitter.event().comment("keepalive"));
                    } catch (Exception ignored) {}
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.info("Debate interrupted after {} rounds", round);
            } catch (Exception e) {
                log.error("Debate stream error: {}", e.getMessage(), e);
                try {
                    sendEvent(emitter, "DEBATE_ERROR", Map.of("message", e.getMessage()));
                } catch (Exception ignored) {}
            }

            // Send completion when loop ends
            if (!emitter.toString().contains("complete")) {
                try {
                    sendEvent(emitter, "DEBATE_COMPLETE", Map.of(
                        "totalResponses", totalMessages.get(),
                        "rounds", round,
                        "topic", topic
                    ));
                    emitter.complete();
                } catch (Exception ignored) {}
            }

            log.info("Debate ended: '{}' | {} rounds | {} total messages", topic, round, totalMessages.get());
        });

        return emitter;
    }

    private synchronized void sendEvent(SseEmitter emitter, String eventName, Object data)
            throws IOException {
        String json = objectMapper.writeValueAsString(data);
        emitter.send(SseEmitter.event().name(eventName).data(json));
    }
}
