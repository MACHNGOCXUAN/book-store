package iuh.fit.backend.repository;

import iuh.fit.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.userId = ?1 AND m.receiver.userId = ?2) OR " +
            "(m.sender.userId = ?2 AND m.receiver.userId = ?1) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUsers(String userId1, String userId2);

    @Query("SELECT m FROM Message m WHERE m.chatSession.sessionId = ?1 ORDER BY m.timestamp ASC")
    List<Message> findBySessionId(String sessionId);

    @Query("SELECT m FROM Message m WHERE m.receiver.userId = ?1 AND m.isRead = false")
    List<Message> findUnreadMessagesByReceiver(String receiverId);
}
