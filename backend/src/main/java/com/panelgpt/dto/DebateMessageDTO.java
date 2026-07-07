package com.panelgpt.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DebateMessageDTO {
    private String id;
    private String personaId;
    private String personaName;
    private String personaColor;
    private String content;
    private int responseOrder;
    private LocalDateTime createdAt;
}
