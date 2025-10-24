package iuh.fit.backend.service.impl;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;


@Service
public class ChatAIServiceImpl implements iuh.fit.backend.service.ChatAIService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    public ChatAIServiceImpl(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    @Override
    public String askGemini(String message) {
        System.out.println("📝 User: " + message);
        
        // Thêm system instruction cho AI
        String systemPrompt = "Bạn là AI tư vấn bán sách. Trả lời ngắn gọn, đúng trọng tâm.";
        String fullMessage = systemPrompt + "\n\nKhách hỏi: " + message;
        
        // Gọi trực tiếp Gemini API - KHÔNG search database
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", fullMessage)))
                )
        );

        try {
            Map<String, Object> response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/gemini-2.5-flash:generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || !response.containsKey("candidates")) {
                return "⚠️ Không có phản hồi từ Gemini AI.";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "⚠️ Gemini AI không thể tạo phản hồi cho câu hỏi này.";
            }
            
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            String aiResponse = parts.get(0).get("text").toString();
            System.out.println("🤖 AI: " + aiResponse);
            return aiResponse;

        } catch (WebClientResponseException.ServiceUnavailable e) {
            System.err.println("❌ Gemini API 503 Error: " + e.getMessage());
            return "⚠️ Dịch vụ Gemini AI hiện đang quá tải. Vui lòng thử lại sau.";
            
        } catch (WebClientResponseException.TooManyRequests e) {
            System.err.println("❌ Gemini API 429 Error: Rate limit exceeded");
            return "⚠️ Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.";
            
        } catch (WebClientResponseException.Unauthorized e) {
            System.err.println("❌ Gemini API 401 Error: Invalid API Key");
            return "⚠️ API Key không hợp lệ. Vui lòng kiểm tra cấu hình.";
            
        } catch (WebClientResponseException e) {
            System.err.println("❌ Gemini API Error " + e.getStatusCode());
            return "⚠️ Lỗi từ Gemini API: " + e.getStatusCode();
            
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Lỗi hệ thống: " + e.getMessage();
        }
    }
}
