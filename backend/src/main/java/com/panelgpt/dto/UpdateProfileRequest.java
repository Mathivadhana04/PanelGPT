package com.panelgpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100)
    private String displayName;

    @Size(min = 7, max = 7, message = "Avatar color must be a valid hex code e.g. #6366F1")
    private String avatarColor;

    private String personaPreferences;
}
