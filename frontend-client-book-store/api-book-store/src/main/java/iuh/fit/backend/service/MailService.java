package iuh.fit.backend.service;

import iuh.fit.backend.model.Mail;
import jakarta.mail.MessagingException;

public interface MailService {
    void sendHTMLEmail(Mail mail) throws MessagingException;
}
