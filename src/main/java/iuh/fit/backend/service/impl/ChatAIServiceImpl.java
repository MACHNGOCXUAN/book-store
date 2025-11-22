package iuh.fit.backend.service.impl;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import iuh.fit.backend.dto.responses.ChatResponse;
import iuh.fit.backend.model.Book;
import iuh.fit.backend.repository.BookRepository;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.netty.http.client.HttpClient;
import io.netty.channel.ChannelOption;


@Service
public class ChatAIServiceImpl implements iuh.fit.backend.service.ChatAIService {

    private final WebClient webClient;
    private final BookRepository bookRepository;


    @Value("${gemini.enabled:true}")
    private boolean geminiEnabled;
    @Value("${gemini.api.key}")
    private String apiKey;

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .responseTimeout(Duration.ofSeconds(15));
        
    public ChatAIServiceImpl(WebClient.Builder builder, BookRepository bookRepository) {
        this.webClient = builder
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.bookRepository = bookRepository;
    }

    @Override
    public ChatResponse askGemini(String message) {
        System.out.println("📝 User: " + message);
        System.out.println("🔑 API Key exists: " + (apiKey != null && !apiKey.isEmpty()));
        // Build context from DB
        String context = buildContextFromDatabase(message);

        // System prompt + context
        String systemPrompt = "Bạn là AI tư vấn bán sách. Trả lời ngắn gọn, đúng trọng tâm. Chỉ dựa vào dữ liệu Context nếu phù hợp.";
        String fullMessage = systemPrompt + "\n\nContext:\n" + (context.isBlank() ? "(Không tìm thấy dữ liệu phù hợp)" : context) + "\n\nKhách hỏi: " + message;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", fullMessage)))
                )
        );
        if (!geminiEnabled) {
            System.out.println("🔕 Gemini disabled via configuration. Returning DB fallback only.");
            return buildFallbackResponse("(Gemini tắt) Dưới đây là dữ liệu tham khảo:", message);
        }

        try {
            String requestUrl = "/v1beta/models/gemini-2.5-flash:generateContent";
            System.out.println("🔗 Calling: " + requestUrl);
            
            Map<String, Object> response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(requestUrl)
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || !response.containsKey("candidates")) {
                return new ChatResponse("⚠️ Không có phản hồi từ Gemini AI.", context, "fallback");
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return new ChatResponse("⚠️ Gemini AI không thể tạo phản hồi cho câu hỏi này.", context, "fallback");
            }
            
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            String aiResponse = parts.get(0).get("text").toString();
            System.out.println("🤖 AI: " + aiResponse);
            return new ChatResponse(aiResponse, context, "ai");

        } catch (WebClientResponseException.ServiceUnavailable e) {
            System.err.println("❌ Gemini API 503 Error: " + e.getMessage());
            return buildFallbackResponse("⚠️ Dịch vụ Gemini AI hiện đang quá tải. Vui lòng thử lại sau.", message);
            
        } catch (WebClientResponseException.TooManyRequests e) {
            System.err.println("❌ Gemini API 429 Error: Rate limit exceeded");
            return buildFallbackResponse("⚠️ Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.", message);
            
        } catch (WebClientResponseException.Unauthorized e) {
            System.err.println("❌ Gemini API 401 Error: Invalid API Key");
            return buildFallbackResponse("⚠️ API Key không hợp lệ. Vui lòng kiểm tra cấu hình.", message);
            
        } catch (WebClientResponseException e) {
            System.err.println("❌ Gemini API Error " + e.getStatusCode());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            String errorDetail = e.getResponseBodyAsString();
            if (errorDetail != null && errorDetail.contains("API key not valid")) {
                return buildFallbackResponse("⚠️ API Key không hợp lệ. Vui lòng cập nhật API key mới tại https://aistudio.google.com/apikey", message);
            }
            return buildFallbackResponse("⚠️ Lỗi từ Gemini API (" + e.getStatusCode() + "): " + errorDetail, message);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi hệ thống: " + e.getClass().getName());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            return buildFallbackResponse("❌ Lỗi hệ thống: " + e.getMessage(), message);
        }
    }

    private String buildContextFromDatabase(String message) {
        if (message == null || message.isBlank()) return "";
        String keyword = extractKeyword(message);
        if (keyword.isBlank()) return "";

        try {
            List<Book> books = bookRepository.findByTitleContainingIgnoreCase(keyword);
            if (books.isEmpty()) return "";
                return books.stream()
                    .limit(5)
                    .map(b -> "- " + truncate(safe(b.getTitle())) + " | Giá: " + b.getPrice() + " | Tồn kho: " + b.getStock())
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            System.err.println("Không thể truy vấn sách cho context: " + e.getMessage());
            return "";
        }
    }

    private String extractKeyword(String message) {
        // Very simple heuristic: take longest word >=4 chars
        String[] parts = message.replaceAll("[?!.]", " ").split("\\s+");
        String best = "";
        for (String p : parts) {
            String cleaned = p.trim();
            if (cleaned.length() >= 4 && cleaned.length() > best.length()) {
                best = cleaned;
            }
        }
        return best.toLowerCase();
    }

    private String safe(String v) { return v == null ? "?" : v; }
    private String truncate(String v) { return v.length() > 60 ? v.substring(0,57) + "..." : v; }

    private ChatResponse buildFallbackResponse(String reply, String message) {
        String context = buildContextFromDatabase(message);
        return new ChatResponse(sanitizeReply(reply), context, "fallback");
    }

    private String sanitizeReply(String reply) {
        if (reply == null) return "⚠️ Lỗi không xác định.";
        String lower = reply.toLowerCase();
        if (lower.contains("failed to resolve") || lower.contains("unknownhost") || lower.contains("dns")) {
            return "⚠️ Không thể kết nối tới dịch vụ AI (DNS/Network). Hệ thống chỉ hiển thị dữ liệu nội bộ.";
        }
        return reply;
    }
}
