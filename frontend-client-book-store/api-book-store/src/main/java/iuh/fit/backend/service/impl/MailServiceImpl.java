package iuh.fit.backend.service.impl;

import iuh.fit.backend.model.Mail;
import iuh.fit.backend.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {
    private final JavaMailSender mailSender;

    public MailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendHTMLEmail(Mail mail) throws MessagingException {
        MimeMessage emailMessage = mailSender.createMimeMessage();
        MimeMessageHelper mailBuilder = new MimeMessageHelper(emailMessage);
        mailBuilder.setTo(mail.getMailTo());
        mailBuilder.setFrom(mail.getMailFrom());
        mailBuilder.setText(mail.getMailContent(), true);
        mailBuilder.setSubject(mail.getMailSubject());
        mailSender.send(emailMessage);
    }
}
