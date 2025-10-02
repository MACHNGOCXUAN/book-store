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
    private String sessionId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;  // 1 customer - n sessions (theo sơ đồ là 1, nhưng thực tế thường nhiều)

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;        // 1 staff - n sessions

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    @Enumerated(EnumType.STRING)
    private ChatStatus status;      // "OPEN", "CLOSED", ...

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Message> messages; // 1 session - n messages
}
