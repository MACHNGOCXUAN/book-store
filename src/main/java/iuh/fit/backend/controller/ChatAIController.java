package iuh.fit.backend.controller;

import iuh.fit.backend.service.ChatAIService;
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
    public String chat(@RequestBody Map<String, String> request) {
        return geminiService.askGemini(request.get("message"));
    }

}
