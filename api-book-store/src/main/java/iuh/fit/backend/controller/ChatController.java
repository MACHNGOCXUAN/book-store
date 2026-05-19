package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.MessageDTO;
import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.model.Customer;
import iuh.fit.backend.service.ChatSessionService;
import iuh.fit.backend.service.CustomerService;
import iuh.fit.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final ChatSessionService chatSessionService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final CustomerService customerService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {

        MessageDTO savedMessage = messageService.saveMessage(messageDTO);

        simpMessagingTemplate.convertAndSend(
                "/topic/messages/" + messageDTO.getReceiverId(),
                savedMessage
        );

        simpMessagingTemplate.convertAndSend(
                "/topic/messages/" + messageDTO.getSenderId(),
                savedMessage
        );

        simpMessagingTemplate.convertAndSend(
                "/topic/session-refresh",
                Map.of("action", "refresh", "timestamp", System.currentTimeMillis())
        );
    }

    @MessageMapping("/chat.typing")
    public void userTyping(@Payload Map<String, String> payload) {
        String receiverId = payload.get("receiverId");
        String senderId = payload.get("senderId");

        simpMessagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/typing",
                Map.of("userId", senderId, "isTyping", true)
        );
    }
}