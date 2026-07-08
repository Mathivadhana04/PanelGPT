package com.panelgpt.controller;

import com.panelgpt.dto.SaveDebateRequest;
import com.panelgpt.service.DebateService;
import com.panelgpt.service.HistoryService;
import com.panelgpt.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/debate")
@RequiredArgsConstructor
@Slf4j
public class DebateController {

    private final DebateService debateService;
    private final HistoryService historyService;
    private final UserService userService;
    private final com.panelgpt.service.OllamaService ollamaService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDebate(
            @RequestParam String topic,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response) {
        // Disable nginx/Render proxy buffering so SSE events flow immediately
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "keep-alive");
        log.info("Starting debate stream — topic: '{}', user: {}", topic, userDetails.getUsername());
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return debateService.streamDebate(topic, userId);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveDebate(
            @Valid @RequestBody SaveDebateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        var session = historyService.saveDebate(userId, request);
        return ResponseEntity.ok(session);
    }

    public record SummaryRequest(String topic, java.util.List<String> messages) {}

    @PostMapping("/summary")
    public ResponseEntity<?> generateSummary(@RequestBody SummaryRequest request) {
        try {
            String summary = ollamaService.generateSummary(request.topic(), request.messages());
            return ResponseEntity.ok(java.util.Map.of("summary", summary));
        } catch (Exception e) {
            log.error("Failed to generate summary: {}", e.getMessage());
            // Fallback summary so the UI doesn't break
            String fallback = "- Key arguments and data points were explored for: " + request.topic() + ".\n" +
                              "- The panel analyzed multiple contrasting perspectives.\n" +
                              "- Trade-offs between theoretical ideas and real-world impacts were highlighted.";
            return ResponseEntity.ok(java.util.Map.of("summary", fallback));
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopDebate(@AuthenticationPrincipal UserDetails userDetails) {
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        debateService.stopDebate(userId);
        return ResponseEntity.ok(java.util.Map.of("message", "Debate stopped successfully"));
    }
}
