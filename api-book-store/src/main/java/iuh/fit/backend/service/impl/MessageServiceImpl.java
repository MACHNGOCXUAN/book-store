package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.*;
import iuh.fit.backend.model.enums.MessageType;
import iuh.fit.backend.repository.ChatSessionRepository;
import iuh.fit.backend.repository.MessageRepository;
import iuh.fit.backend.repository.UserRepository;
import iuh.fit.backend.dto.requests.MessageDTO;
import iuh.fit.backend.service.MessageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ChatSessionRepository chatSessionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MessageDTO saveMessage(MessageDTO messageDTO) {
        if (messageDTO.getSenderId() == null) {
            throw new IllegalArgumentException("SenderId must not be null");
        }
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver;
        if (messageDTO.getReceiverId() != null) {
            receiver = userRepository.findById(messageDTO.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
        } else {
            receiver = null;
        }

        ChatSession session;

        if (sender instanceof Staff staffSender) {
            session = chatSessionRepository
                    .findSessionBetweenCustomerAndStaff(
                            receiver.getUserId(),
                            sender.getUserId()
                    ).orElse(null);

            if (session == null) {
                session = createNewSession(receiver, sender);
            } else if (session.getStaff() == null) {
                session.setStaff(staffSender);
                chatSessionRepository.save(session);
            }

            List<Message> oldMessages = messageRepository.findBySessionId(session.getSessionId());
            for (Message m : oldMessages) {
                if (m.getReceiver() == null || !(m.getReceiver() instanceof Staff)) {
                    m.setReceiver(staffSender);
                    messageRepository.save(m);
                }
            }
        } else if (sender instanceof Admin) {
            session = chatSessionRepository
                    .findSessionBetweenCustomerAndStaff(
                            sender.getUserId(),
                            receiver != null ? receiver.getUserId() : null
                    )
                    .orElseGet(() -> createNewSession(receiver, sender));
        } else {
            session = chatSessionRepository
                    .findSessionBetweenCustomerAndStaff(
                            sender.getUserId(),
                            receiver != null ? receiver.getUserId() : null
                    )
                    .orElseGet(() -> createNewSession(sender, receiver));
        }

        session.setLastMessageTime(LocalDateTime.now());
        session.setLastMessage(messageDTO.getContent());
        session = chatSessionRepository.save(session);

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setMessageType(
                messageDTO.getMessageType() != null ? messageDTO.getMessageType() : MessageType.TEXT
        );
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

        if (user1 instanceof Customer) {
            session.setCustomer((Customer) user1);
            session.setStaff(user2 instanceof Staff ? (Staff) user2 : null);
        } else if (user2 instanceof Customer) {
            session.setCustomer((Customer) user2);
            session.setStaff(user1 instanceof Staff ? (Staff) user1 : null);
        } else {
            session.setCustomer(null);
            session.setStaff(user1 instanceof Staff ? (Staff) user1 : null);
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

    @Override
    public Optional<ChatSession> getChatSession(String customerId) {
        return chatSessionRepository.findActiveSessionByCustomerId(customerId);
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setSenderId(message.getSender().getUserId());
        dto.setReceiverId(message.getReceiver() != null ? message.getReceiver().getUserId() : null);
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
