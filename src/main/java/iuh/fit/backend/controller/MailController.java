package iuh.fit.backend.controller;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@RestController
public class MailController {
    private final JavaMailSender mailSender;

    private final SpringTemplateEngine templateEngine;

    private final String mailTo = "machngocxuan2004@gmail.com";

    public MailController(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @RequestMapping("/test")
    public String sendTestReport(HttpServletRequest request) {
        String responseMessage = request.getRequestURI();

        try {
            Context context = new Context();
            context.setVariable("subject", "Hello");
            context.setVariable("content", "Hello World");

            String html = templateEngine.process("mail-template.html", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(mailTo);
            helper.setSubject("Test Email");
            helper.setText(html, true);

            // 4. Gửi email
            mailSender.send(message);

        } catch (MessagingException e) {
            responseMessage = "Lỗi gửi mail " + e.getMessage();
            return responseMessage;
        }

        responseMessage = "Gửi mail thành công!";
        return responseMessage;
    }
}
