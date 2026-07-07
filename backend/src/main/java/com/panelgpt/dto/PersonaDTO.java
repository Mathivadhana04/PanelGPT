package com.panelgpt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PersonaDTO {
    private String id;
    private String name;
    private String role;
    private String description;
    private String color;
    private String icon;
}
