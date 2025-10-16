package iuh.fit.backend.service;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.model.Message;
import iuh.fit.backend.model.User;
import iuh.fit.backend.requests.MessageDTO;

import java.util.List;

public interface MessageService {
    MessageDTO saveMessage(MessageDTO messageDTO);
    ChatSession createNewSession(User user1, User user2);
    List<MessageDTO> getMessagesBetweenUsers(String userId1, String userId2);
    List<MessageDTO> getMessagesBySession(String sessionId);
    void markMessagesAsRead(String receiverId, String senderId);
    int getUnreadCount(String receiverId);
}
