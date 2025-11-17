package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.ChatStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "chat_sessions")
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = true)
    private Staff staff;

    private LocalDateTime startTime;
    private LocalDateTime lastMessageTime;
    private String lastMessage;
    private boolean isActive;

    @PrePersist
    public void prePersist() {
        if (startTime == null) {
            startTime = LocalDateTime.now();
        }
        if (lastMessageTime == null) {
            lastMessageTime = LocalDateTime.now();
        }
        isActive = true;
    }
}
