package com.panelgpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class SaveDebateRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    private Integer durationSeconds;

    @NotEmpty(message = "Messages are required")
    private List<MessageItem> messages;

    @Data
    public static class MessageItem {
        private String personaId;
        private String personaName;
        private String content;
        private int responseOrder;
    }
}
