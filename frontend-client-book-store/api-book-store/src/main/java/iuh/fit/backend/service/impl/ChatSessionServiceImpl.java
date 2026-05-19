package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.repository.ChatSessionRepository;
import iuh.fit.backend.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatSessionServiceImpl implements ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;

    @Override
    public ChatSession save(ChatSession chatSession) {
        if (chatSession.getSessionId() == null || chatSession.getSessionId().isEmpty()) {
            chatSession.setSessionId(UUID.randomUUID().toString());
            return chatSessionRepository.save(chatSession); // chỉ tạo mới
        } else {
            // Kiểm tra nếu đã tồn tại thì chỉ cập nhật field cần thiết
            return chatSessionRepository.findById(chatSession.getSessionId())
                    .map(existing -> {
                        existing.setLastMessageTime(LocalDateTime.now());
                        existing.setActive(true);
                        return chatSessionRepository.save(existing);
                    })
                    .orElseGet(() -> chatSessionRepository.save(chatSession));
        }
    }

    @Override
    public ChatSession findById(String id) {
        return chatSessionRepository.findById(id).orElse(null);
    }
}
