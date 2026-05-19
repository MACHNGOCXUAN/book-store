package iuh.fit.backend.controller;

import iuh.fit.backend.service.ChatAIService;
import iuh.fit.backend.dto.responses.ChatResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
//@CrossOrigin(origins = "http://localhost:3001")
public class ChatAIController {

    private final ChatAIService geminiService;

    public ChatAIController(ChatAIService geminiService) {
        this.geminiService = geminiService;
    }


    @PostMapping
    public ChatResponse chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        return geminiService.askGemini(message);
    }

}
