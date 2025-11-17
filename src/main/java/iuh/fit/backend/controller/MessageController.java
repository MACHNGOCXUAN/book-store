package iuh.fit.backend.controller;

import iuh.fit.backend.model.ChatSession;
import iuh.fit.backend.dto.requests.MessageDTO;
import iuh.fit.backend.service.MessageService;
import iuh.fit.backend.service.StaffService;
import iuh.fit.backend.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final StaffService staffService;
    private final JwtUtils jwtUtils;

    private static final String UPLOAD_DIR = "uploads/messages/";

    // Lấy tin nhắn giữa 2 users
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam String userId1,
            @RequestParam String userId2) {
        List<MessageDTO> messages = messageService.getMessagesBetweenUsers(userId1, userId2);
        return ResponseEntity.ok(Map.of("data", messages));
    }

    // Lấy tin nhắn theo session
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getMessagesBySession(@PathVariable String sessionId) {
        List<MessageDTO> messages = messageService.getMessagesBySession(sessionId);
        return ResponseEntity.ok(Map.of("data", messages));
    }

    // Đánh dấu đã đọc
    @PostMapping("/mark-read")
    public ResponseEntity<?> markAsRead(
            @RequestParam String receiverId,
            @RequestParam String senderId) {
        messageService.markMessagesAsRead(receiverId, senderId);
        return ResponseEntity.ok(Map.of("message", "Messages marked as read"));
    }

    // Đếm tin nhắn chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestParam String receiverId) {
        int count = messageService.getUnreadCount(receiverId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Upload file (ảnh, video, document)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file unique
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String newFileName = UUID.randomUUID().toString() + extension;

            // Lưu file
            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), filePath);

            // Trả về URL
            String fileUrl = "/uploads/messages/" + newFileName;

            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", originalFileName);
            response.put("fileSize", formatFileSize(file.getSize()));
            response.put("fileType", getFileType(file.getContentType()));

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Upload file thất bại"));
        }
    }

    // Lấy danh sách khách hàng đang chat với staff
    @GetMapping("/staff/customers")
    public ResponseEntity<?> getCustomersChattingWithStaff(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }

        String token = authHeader.substring(7);
        String staffId = jwtUtils.getUserIdFromToken(token);

        List<ChatSession> chatSessions = staffService.getCustomersChattingWithStaff(staffId);

        return ResponseEntity.ok(Map.of("data", chatSessions));
    }

    @GetMapping("/staff/customers/staff")
    public ResponseEntity<?> getStaffsChattingWithCustomer(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }

        String token = authHeader.substring(7);
        String staffId = jwtUtils.getUserIdFromToken(token);

        List<ChatSession> chatSessions = staffService.getStaffsChattingWithCustomer(staffId);

        return ResponseEntity.ok(Map.of("data", chatSessions));
    }

    private String getFileType(String contentType) {
        if (contentType == null) return "file";
        if (contentType.startsWith("image/")) return "image";
        if (contentType.startsWith("video/")) return "video";
        return "file";
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    @GetMapping("/chat-session/user/{userId}")
    private ResponseEntity<?>  getSessionCustomer(@PathVariable String userId) {
        Optional<ChatSession> optionalChatSession = messageService.getChatSession(userId);
        ChatSession chatSession = optionalChatSession.get();

        return ResponseEntity.ok(Map.of("data", chatSession));
    }
}