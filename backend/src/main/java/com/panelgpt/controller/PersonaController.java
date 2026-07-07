package com.panelgpt.controller;

import com.panelgpt.dto.PersonaDTO;
import com.panelgpt.service.OllamaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PersonaController {

    @GetMapping("/personas")
    public ResponseEntity<List<PersonaDTO>> getPersonas() {
        List<PersonaDTO> personas = OllamaService.PERSONAS.values().stream()
                .map(p -> PersonaDTO.builder()
                        .id(p.id())
                        .name(p.name())
                        .role(p.role())
                        .description(p.description())
                        .color(p.color())
                        .icon(p.icon())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(personas);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(java.util.Map.of(
            "status", "UP",
            "service", "PanelGPT API",
            "version", "1.0.0"
        ));
    }
}
