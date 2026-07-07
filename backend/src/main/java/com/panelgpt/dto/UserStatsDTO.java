package com.panelgpt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsDTO {
    private long totalDebates;
    private long debatesThisWeek;
    private String topTopic;
    private long totalPersonasUsed;
}
