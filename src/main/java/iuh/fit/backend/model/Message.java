package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.MessageStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "messages")
public class Message {
    @Id
    private String messageId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(length = 4000)
    private String content;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;   // "SENT", "DELIVERED", "READ"
}
