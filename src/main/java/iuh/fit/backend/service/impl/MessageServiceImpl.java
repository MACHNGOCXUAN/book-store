package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.*;
import iuh.fit.backend.model.enums.MessageType;
import iuh.fit.backend.repository.ChatSessionRepository;
import iuh.fit.backend.repository.MessageRepository;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.requests.MessageDTO;
import iuh.fit.backend.service.MessageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public MessageDTO saveMessage(MessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Tìm hoặc tạo chat session
        ChatSession session = chatSessionRepository
                .findSessionBetweenUsers(sender.getUserId(), receiver.getUserId())
                .orElseGet(() -> createNewSession(sender, receiver));

        // Update last message time
        session.setLastMessageTime(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Tạo message
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setMessageType(messageDTO.getMessageType() != null ?
                messageDTO.getMessageType() : MessageType.TEXT);
        message.setFileUrl(messageDTO.getFileUrl());
        message.setFileName(messageDTO.getFileName());
        message.setFileSize(messageDTO.getFileSize());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        message.setChatSession(session);

        Message savedMessage = messageRepository.save(message);

        return convertToDTO(savedMessage);
    }

    @Override
    public ChatSession createNewSession(User user1, User user2) {
        ChatSession session = new ChatSession();

        // Xác định ai là customer, ai là staff
        if (user1 instanceof Customer) {
            session.setCustomer((Customer) user1);
            session.setStaff((Staff) user2);
        } else {
            session.setCustomer((Customer) user2);
            session.setStaff((Staff) user1);
        }

        session.setStartTime(LocalDateTime.now());
        session.setLastMessageTime(LocalDateTime.now());
        session.setActive(true);

        return chatSessionRepository.save(session);
    }

    @Override
    public List<MessageDTO> getMessagesBetweenUsers(String userId1, String userId2) {
        List<Message> messages = messageRepository.findMessagesBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getMessagesBySession(String sessionId) {
        List<Message> messages = messageRepository.findBySessionId(sessionId);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(String receiverId, String senderId) {
        List<Message> unreadMessages = messageRepository
                .findMessagesBetweenUsers(receiverId, senderId)
                .stream()
                .filter(m -> m.getReceiver().getUserId().equals(receiverId) && !m.isRead())
                .collect(Collectors.toList());

        unreadMessages.forEach(m -> m.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    @Override
    public int getUnreadCount(String receiverId) {
        return messageRepository.findUnreadMessagesByReceiver(receiverId).size();
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setSenderId(message.getSender().getUserId());
        dto.setReceiverId(message.getReceiver().getUserId());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setFileUrl(message.getFileUrl());
        dto.setFileName(message.getFileName());
        dto.setFileSize(message.getFileSize());
        dto.setTimestamp(message.getTimestamp()
                .format(DateTimeFormatter.ofPattern("HH:mm")));
        dto.setRead(message.isRead());
        dto.setSessionId(message.getChatSession() != null ?
                message.getChatSession().getSessionId() : null);
        return dto;
    }
}
