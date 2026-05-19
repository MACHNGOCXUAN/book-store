package iuh.fit.backend.service;

import iuh.fit.backend.dto.responses.ChatResponse;

public interface ChatAIService {
    ChatResponse askGemini(String message);
}
