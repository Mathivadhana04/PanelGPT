package com.panelgpt.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DebateSessionDTO {
    private String id;
    private String topic;
    private String status;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
    private int messageCount;
    private List<DebateMessageDTO> messages;
}
