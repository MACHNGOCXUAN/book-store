package iuh.fit.backend.dto.responses;

public class ChatResponse {
    private String reply;
    private String context;
    private String source; // ai|fallback

    public ChatResponse() {}

    public ChatResponse(String reply, String context, String source) {
        this.reply = reply;
        this.context = context;
        this.source = source;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
