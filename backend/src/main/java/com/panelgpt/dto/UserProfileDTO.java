package com.panelgpt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarColor;
    private String personaPreferences;
    private String createdAt;
}
