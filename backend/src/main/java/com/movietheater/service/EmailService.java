package com.movietheater.service;

import com.movietheater.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("🎬 Booking Confirmed - " + booking.getBookingNumber());
            helper.setText(buildBookingConfirmationHtml(booking), true);

            mailSender.send(message);
            logger.info("Booking confirmation email sent for: {}", booking.getBookingNumber());
        } catch (MessagingException e) {
            logger.error("Failed to send booking confirmation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("Booking Cancelled - " + booking.getBookingNumber());
            helper.setText(buildCancellationHtml(booking), true);

            mailSender.send(message);
            logger.info("Cancellation email sent for: {}", booking.getBookingNumber());
        } catch (MessagingException e) {
            logger.error("Failed to send cancellation email: {}", e.getMessage());
        }
    }

    private String buildBookingConfirmationHtml(Booking booking) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #0a0a1a; color: #fff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; padding: 30px;">
                    <h1 style="color: #e94560; text-align: center;">🎬 Booking Confirmed!</h1>
                    <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <p><strong>Booking Number:</strong> %s</p>
                        <p><strong>Movie:</strong> %s</p>
                        <p><strong>Theater:</strong> %s</p>
                        <p><strong>Show Time:</strong> %s</p>
                        <p><strong>Total Amount:</strong> ₹%.2f</p>
                    </div>
                    <p style="color: #aaa; text-align: center;">Thank you for booking with CineMax!</p>
                </div>
            </body>
            </html>
            """.formatted(
                booking.getBookingNumber(),
                booking.getShow().getMovie().getTitle(),
                booking.getShow().getScreen().getTheater().getName(),
                booking.getShow().getStartTime(),
                booking.getFinalAmount()
            );
    }

    private String buildCancellationHtml(Booking booking) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #0a0a1a; color: #fff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; padding: 30px;">
                    <h1 style="color: #f59e0b; text-align: center;">Booking Cancelled</h1>
                    <p>Your booking <strong>%s</strong> has been cancelled.</p>
                    <p>Refund of <strong>₹%.2f</strong> will be processed in 5-7 business days.</p>
                </div>
            </body>
            </html>
            """.formatted(booking.getBookingNumber(), booking.getFinalAmount());
    }
}
