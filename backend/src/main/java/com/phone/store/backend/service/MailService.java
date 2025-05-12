package com.phone.store.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.constraints.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendLink(@Email String email, String refreshToken) throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

        String linkConfirm = String.format("http://localhost:3000/password-reset-success?refreshToken=%s", refreshToken);

        String emailContent = String.format(
                "Chào bạn,<br><br>" +
                        "<p>Chỉ cần nhấp vào liên kết bên dưới để xác nhận tài khoản của bạn và đặt lại mật khẩu:</p>" +
                        "<p class='password'>Mật khẩu mới của bạn là: 123456</p><br>" +
                        "<a href='%s'>Reset mật khẩu</a><br><br>Thân ái!", linkConfirm);

        helper.setFrom(from, "Smartphone Store");
        helper.setTo(email);
        helper.setSubject("Please confirm your account");
        helper.setText(emailContent, true);

        mailSender.send(mimeMessage);
    }

    public void sendOrderStatusMessage(@Email String email, Long orderCode, String receiverName, String shippingAddress, String orderStatus, String adminMessage) throws MessagingException, UnsupportedEncodingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

        String emailContent = String.format(
                "Chào bạn,<br><br>" +
                        "Đơn hàng có mã <strong>%s</strong> được gửi đến <strong>%s</strong> với địa chỉ <strong>%s</strong> đã được cập nhật trạng thái <strong>%s</strong> với thông báo:<br>" +
                        "<p><strong>%s</strong></p><br>" +
                        "Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ lại với chúng tôi.<br><br>Xin cảm ơn!",
                orderCode, receiverName, shippingAddress, orderStatus, adminMessage);

        helper.setFrom(from, "Smartphone Store");
        helper.setTo(email);
        helper.setSubject("Cập nhật trạng thái đơn hàng");
        helper.setText(emailContent, true);

        mailSender.send(mimeMessage);
    }






}
