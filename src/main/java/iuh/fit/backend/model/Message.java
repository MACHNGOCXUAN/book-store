package iuh.fit.backend.model;

import iuh.fit.backend.model.enums.MessageStatus;
import iuh.fit.backend.model.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter @ToString
@Entity @Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String messageId;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = true)
    private User receiver;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType messageType; // TEXT, IMAGE, VIDEO, FILE

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private String fileSize;

    private LocalDateTime timestamp;

    private boolean isRead;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private ChatSession chatSession;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (messageType == null) {
            messageType = MessageType.TEXT;
        }
    }
}
