package iuh.fit.backend.controller;

import iuh.fit.backend.dto.requests.MessageDTO;
import iuh.fit.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO messageDTO, Principal principal) {
        System.out.println("xuan: " + principal);
        // Lưu message vào DB
        MessageDTO savedMessage = messageService.saveMessage(messageDTO);

//        System.out.println("receiver: /user/" + messageDTO.getReceiverId() + "/queue/messages");
//        simpMessagingTemplate.convertAndSendToUser(
//                messageDTO.getReceiverId(),
//                "/queue/messages",
//                savedMessage
//        );
//
//        // Gửi cho SENDER (confirm)
//        System.out.println("sender: /user/" + messageDTO.getSenderId() + "/queue/messages");
//        simpMessagingTemplate.convertAndSendToUser(
//                messageDTO.getSenderId(),
//                "/queue/messages",
//                savedMessage
//        );
//


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