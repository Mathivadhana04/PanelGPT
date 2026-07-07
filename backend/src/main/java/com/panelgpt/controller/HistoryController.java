package com.panelgpt.controller;

import com.panelgpt.dto.DebateSessionDTO;
import com.panelgpt.service.HistoryService;
import com.panelgpt.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<DebateSessionDTO>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(historyService.getUserDebates(userId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebateSessionDTO> getDebate(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(historyService.getDebateById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDebate(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userService.getUserByEmail(userDetails.getUsername()).getId();
        historyService.deleteDebate(id, userId);
        return ResponseEntity.ok(Map.of("message", "Debate deleted successfully"));
    }
}
