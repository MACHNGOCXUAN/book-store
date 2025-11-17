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
//        if (messageDTO.getSessionId() == null) {
//            ChatSession chatSession = new ChatSession();
//
//            System.out.println("chat 1 2: " + messageDTO);
//
//            chatSession.setStaff(null);
//            Customer customer = customerService.findCustomerById(messageDTO.getSenderId());
//            chatSession.setCustomer(customer);
//            chatSession.setActive(true);
//            chatSession.setStartTime(LocalDateTime.now());
//            chatSession.setLastMessageTime(LocalDateTime.now());
//
//            ChatSession savedChatSession = chatSessionService.save(chatSession);
//            messageDTO.setSessionId(savedChatSession.getSessionId());
//        }

        MessageDTO savedMessage = messageService.saveMessage(messageDTO);

        // Gửi cho người nhận theo userId
        simpMessagingTemplate.convertAndSend(
                "/topic/messages/" + messageDTO.getReceiverId(),
                savedMessage
        );

        // Gửi confirm cho sender
        simpMessagingTemplate.convertAndSend(
                "/topic/messages/" + messageDTO.getSenderId(),
                savedMessage
        );
    }

    /**
     * User typing indicator
     */
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