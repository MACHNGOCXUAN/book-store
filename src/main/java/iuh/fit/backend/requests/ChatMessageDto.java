package iuh.fit.backend.requests;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String sessionId;
    private String senderId;
    private String receiverId;
    private String content;
}
