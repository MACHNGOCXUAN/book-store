package iuh.fit.backend.requests;

import iuh.fit.backend.model.enums.MessageType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private String messageId;
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType messageType;
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private String timestamp;
    private boolean isRead;
    private String sessionId;
}
