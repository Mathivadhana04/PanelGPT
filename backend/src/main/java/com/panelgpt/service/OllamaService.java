package com.panelgpt.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
public class OllamaService {

    @Value("${ollama.base-url:http://localhost:11434}")
    private String baseUrl;

    @Value("${ollama.model:llama3}")
    private String model;

    @Value("${ollama.timeout-seconds:90}")
    private int timeoutSeconds;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static final Map<String, PersonaConfig> PERSONAS = new LinkedHashMap<>();

    static {
        PERSONAS.put("scientist", new PersonaConfig(
            "scientist", "Dr. Elena Voss", "Empirical Scientist",
            "Evidence-based. Always cites data.", "#3B82F6", "🔬",
            "scientist",
            "You share one simple scientific or technical fact. Simple words only. No jargon. One sentence."
        ));
        PERSONAS.put("contrarian", new PersonaConfig(
            "contrarian", "Rex Holloway", "The Contrarian",
            "Challenges consensus. Finds the overlooked angle.", "#EF4444", "⚡",
            "contrarian",
            "You share one fact that most people overlook or get wrong. Simple words. One sentence."
        ));
        PERSONAS.put("visionary", new PersonaConfig(
            "visionary", "Zara Osei", "Futurist Visionary",
            "Sees what's coming next. Future-focused.", "#10B981", "🚀",
            "visionary",
            "You share one fact about where this topic is heading in the future. Simple words. One sentence."
        ));
        PERSONAS.put("philosopher", new PersonaConfig(
            "philosopher", "Prof. Kiran Mehta", "Stoic Philosopher",
            "First principles. Deep observations.", "#8B5CF6", "🏛️",
            "philosopher",
            "You share one core fact about the nature or origin of this topic. Simple words. One sentence."
        ));
        PERSONAS.put("street_voice", new PersonaConfig(
            "street_voice", "Jordan Reyes", "The People's Voice",
            "Real-world impact. Speaks for everyday people.", "#F59E0B", "🗣️",
            "street_voice",
            "You share one fact about how this topic affects normal everyday people. Very simple words. One sentence."
        ));
        PERSONAS.put("satirist", new PersonaConfig(
            "satirist", "Maxine Draper", "Political Satirist",
            "Exposes contradictions with wit.", "#EC4899", "🎭",
            "satirist",
            "You share one ironic or surprising fact that reveals something funny or contradictory about this topic. Simple words. One sentence."
        ));
    }

    /**
     * Generate one focused fact about the topic from a persona's viewpoint.
     * @param personaId   which persona
     * @param topic       the debate topic (verbatim from user)
     * @param round       round number — used to force a different fact each call
     */
    public String generateResponse(String personaId, String topic, int round)
            throws IOException, InterruptedException {

        PersonaConfig persona = PERSONAS.get(personaId);
        if (persona == null) throw new IllegalArgumentException("Unknown persona: " + personaId);

        // Build a very direct, constrained prompt
        String prompt =
            "ROLE: " + persona.role() + "\n" +
            "RULE: " + persona.promptInstruction() + "\n" +
            "RULE: Do NOT talk about anything unrelated to the topic.\n" +
            "RULE: Write in plain, simple English that a 14-year-old can understand.\n" +
            "RULE: One sentence only. No greeting. No 'I think'. No 'As a ...'. Start with the fact.\n" +
            "RULE: This is fact number " + round + " — give a DIFFERENT fact than previous rounds.\n\n" +
            "TOPIC: \"" + topic + "\"\n\n" +
            "YOUR FACT:";

        // Use Groq if API key is present
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                String result = generateGroqResponse(prompt);
                // Post-process
                result = result.replaceAll("(?i)^(As a[^:]+:|YOUR FACT:|FACT:|[A-Z][a-z]+ [A-Z][a-z]+:)\\s*", "");
                result = firstSentence(result);
                log.info("Round {} | {} (Groq) → '{}'", round, personaId, result);
                return result;
            } catch (Exception e) {
                log.warn("Groq request failed, falling back to local Ollama: {}", e.getMessage());
            }
        }

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        ObjectNode opts = objectMapper.createObjectNode();
        opts.put("temperature", 0.8);
        opts.put("top_p", 0.9);
        opts.put("num_ctx", 256);         // Extremely small context window = instant CPU generation
        opts.put("num_predict", 35);       // Limit generation output length for speed (~15-20 words)
        opts.put("repeat_penalty", 1.2);   // Discourage repetitions
        requestBody.set("options", opts);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/generate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Ollama API error: " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        String result = json.path("response").asText().trim();

        // ── Post-process: strip any accidental "As a ...: " prefixes ──
        result = result.replaceAll("(?i)^(As a[^:]+:|YOUR FACT:|FACT:|[A-Z][a-z]+ [A-Z][a-z]+:)\\s*", "");
        // Keep only first sentence
        result = firstSentence(result);

        log.info("Round {} | {} (Ollama) → '{}'", round, personaId, result);
        return result;
    }

    private String generateGroqResponse(String prompt) throws IOException, InterruptedException {
        ObjectNode requestBody = objectMapper.createObjectNode();
        // llama-3.1-8b-instant is fast and free
        requestBody.put("model", "llama-3.1-8b-instant");
        
        var messages = objectMapper.createArrayNode();
        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", prompt);
        messages.add(userMsg);
        requestBody.set("messages", messages);
        
        requestBody.put("temperature", 0.6);
        requestBody.put("max_tokens", 80);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey.trim())
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpResponse<String> response = executeGroqRequestWithRetry(request);

        JsonNode json = objectMapper.readTree(response.body());
        String text = json.path("choices").path(0).path("message").path("content").asText().trim();
        
        if (text.startsWith("\"") && text.endsWith("\"")) {
            text = text.substring(1, text.length() - 1);
        }
        return text;
    }

    public String generateSummary(String topic, java.util.List<String> facts) throws IOException, InterruptedException {
        StringBuilder factsText = new StringBuilder();
        if (facts != null) {
            for (String fact : facts) {
                factsText.append("- ").append(fact).append("\n");
            }
        }

        String prompt =
            "You are an AI debate summarizer.\n" +
            "RULE: Summarize the key arguments/perspectives on the topic below.\n" +
            "RULE: Use simple, plain English.\n" +
            "RULE: Provide 3 short, high-impact bullet points outlining the main ideas discussed.\n" +
            "RULE: Keep each bullet point under 15 words.\n" +
            "RULE: Do NOT write any greeting, introduction, or concluding words. Just output the 3 bullet points.\n\n" +
            "TOPIC: \"" + topic + "\"\n" +
            "POINTS DISCUSSED:\n" + factsText.toString() + "\n" +
            "SUMMARY BULLET POINTS:";

        // Use Groq if API key is present
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                String summary = generateGroqSummary(prompt);
                log.info("Generated summary using Groq cloud model.");
                return summary;
            } catch (Exception e) {
                log.warn("Groq summary failed, falling back to local Ollama: {}", e.getMessage());
            }
        }

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        ObjectNode opts = objectMapper.createObjectNode();
        opts.put("temperature", 0.6);
        opts.put("top_p", 0.9);
        opts.put("num_predict", 100);
        opts.put("num_ctx", 1024);
        requestBody.set("options", opts);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/generate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Ollama API error: " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        return json.path("response").asText().trim();
    }

    private String generateGroqSummary(String prompt) throws IOException, InterruptedException {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", "llama-3.1-8b-instant");
        
        var messages = objectMapper.createArrayNode();
        var userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", prompt);
        messages.add(userMsg);
        requestBody.set("messages", messages);
        
        requestBody.put("temperature", 0.5);
        requestBody.put("max_tokens", 150);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey.trim())
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpResponse<String> response = executeGroqRequestWithRetry(request);

        JsonNode json = objectMapper.readTree(response.body());
        return json.path("choices").path(0).path("message").path("content").asText().trim();
    }

    private HttpResponse<String> executeGroqRequestWithRetry(HttpRequest request) throws IOException, InterruptedException {
        int maxRetries = 3;
        int delayMs = 1500;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return response;
            }
            if (response.statusCode() == 429) {
                log.warn("Groq API rate limit hit (429). Retrying in {}ms... (Attempt {}/{})", delayMs, attempt, maxRetries);
                Thread.sleep(delayMs);
                delayMs *= 2;
                continue;
            }
            log.error("Groq API error (status {}): {}", response.statusCode(), response.body());
            throw new IOException("Groq API error: " + response.statusCode());
        }
        throw new IOException("Groq API rate limit exceeded after " + maxRetries + " retries.");
    }

    private String firstSentence(String text) {
        // Find end of first sentence (. ! ?)
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '.' || c == '!' || c == '?') {
                String candidate = text.substring(0, i + 1).trim();
                if (candidate.split("\\s+").length >= 4) return candidate; // at least 4 words
            }
        }
        // If no punctuation found, return as-is trimmed
        return text.trim();
    }

    public record PersonaConfig(
        String id,
        String name,
        String role,
        String description,
        String color,
        String icon,
        String type,
        String promptInstruction
    ) {}
}
