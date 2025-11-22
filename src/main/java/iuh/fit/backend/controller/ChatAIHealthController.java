package iuh.fit.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/chat/health")
public class ChatAIHealthController {

    @Value("${gemini.enabled:true}")
    private boolean geminiEnabled;

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("geminiEnabled", geminiEnabled);
        result.put("dnsOk", testDns("generativelanguage.googleapis.com"));
        return result;
    }

    private boolean testDns(String host) {
        try {
            InetAddress.getByName(host);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
