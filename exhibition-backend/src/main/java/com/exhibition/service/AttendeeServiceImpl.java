package com.exhibition.service;

import com.exhibition.model.Attendee;
import com.exhibition.repository.AttendeeRepository;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;
import org.mindrot.jbcrypt.BCrypt;

public class AttendeeServiceImpl implements AttendeeService {

    private final AttendeeRepository attendeeRepository;
    private final EmailService emailService;

    public AttendeeServiceImpl(AttendeeRepository attendeeRepository) {
        this.attendeeRepository = attendeeRepository;
        
        String smtpHost = EmailService.getConfig("SMTP_HOST");
        if (smtpHost == null || smtpHost.isBlank()) {
            smtpHost = "smtp.gmail.com";
        }
        
        int smtpPort = EmailService.getIntConfig("SMTP_PORT", 587);
        String smtpUser = EmailService.getConfig("SMTP_USER");
        String smtpPass = EmailService.getConfig("SMTP_PASSWORD");
        String from = EmailService.getConfig("SMTP_FROM");
        if (from == null || from.isBlank()) {
            from = smtpUser; // Use SMTP_USER as sender if SMTP_FROM not set
        }
        
        String useTlsStr = EmailService.getConfig("SMTP_USE_TLS");
        boolean useTls = !"false".equalsIgnoreCase(useTlsStr);
        
        System.out.println("Email service configured with host: " + smtpHost + ", port: " + smtpPort);
        this.emailService = new EmailService(smtpHost, smtpPort, smtpUser, smtpPass, from, useTls);
    }

    @Override
    public void registerAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler) {
        // Hash the password before persisting - ensure consistent trimming
        if (attendee.getPassword() != null && !attendee.getPassword().isBlank()) {
            // Ensure consistent password processing: trim and validate
            String trimmedPassword = attendee.getPassword().trim();
            String hashed = BCrypt.hashpw(trimmedPassword, BCrypt.gensalt(12));
            attendee.setPassword(hashed);
        }

        attendeeRepository.addAttendee(attendee, ar -> {
            if (ar.succeeded()) {
                // Registration succeeded. We no longer send a receipt via email;
                // the attendee can download their receipt from their dashboard.
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }

    @Override
    public void getAttendee(int id, Handler<AsyncResult<Attendee>> resultHandler) {
        attendeeRepository.getAttendeeById(id, resultHandler);
    }

    @Override
    public void listAttendees(Handler<AsyncResult<List<Attendee>>> resultHandler) {
        attendeeRepository.getAllAttendees(resultHandler);
    }

    @Override
    public void updateAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler) {
        attendeeRepository.updateAttendee(attendee, resultHandler);
    }

    @Override
    public void removeAttendee(int id, Handler<AsyncResult<Void>> resultHandler) {
        attendeeRepository.deleteAttendee(id, resultHandler);
    }

    public void resetAttendeePassword(String email, Handler<AsyncResult<String>> resultHandler) {
        // First, find the attendee by email
        attendeeRepository.getAttendeeByEmail(email, ar -> {
            if (ar.succeeded() && ar.result() != null) {
                Attendee attendee = ar.result();
                // Generate a new temporary password
                String newPassword = generateTemporaryPassword();

                // Hash the new temporary password before storing
                String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt(12));
                attendee.setPassword(hashed);
                attendee.setTemporaryPassword(true);
                attendeeRepository.updateAttendeePasswordWithTemporaryFlag(attendee.getAttendeeId(), hashed, true, updateRes -> {
                    if (updateRes.succeeded()) {
                        // Send email with new password
                        try {
                            emailService.sendAttendeePasswordReset(attendee.getEmail(), attendee.getName(), newPassword);
                            resultHandler.handle(io.vertx.core.Future.succeededFuture("Password reset email sent successfully"));
                        } catch (Exception e) {
                            resultHandler.handle(io.vertx.core.Future.failedFuture("Failed to send email: " + e.getMessage()));
                        }
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Failed to update password: " + updateRes.cause().getMessage()));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture("Attendee not found with email: " + email));
            }
        });
    }

    private String generateTemporaryPassword() {
        // Generate a simple temporary password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return password.toString();
    }

    @Override
    public void updateAttendeePassword(int attendeeId, String password, Handler<AsyncResult<Void>> resultHandler) {
        // When user changes password, clear the temporary password flag and ensure consistent trimming
        if (password != null && !password.isBlank()) {
            String trimmedPassword = password.trim();
            String hashed = BCrypt.hashpw(trimmedPassword, BCrypt.gensalt(12));
            attendeeRepository.updateAttendeePasswordWithTemporaryFlag(attendeeId, hashed, false, resultHandler);
        } else {
            // Fallback: do not attempt to hash an empty password
            attendeeRepository.updateAttendeePasswordWithTemporaryFlag(attendeeId, password, false, resultHandler);
        }
    }

    @Override
    public void updatePaymentFeeByEmail(String email, Double paymentFee, Handler<AsyncResult<Void>> resultHandler) {
        attendeeRepository.updatePaymentFeeByEmail(email, paymentFee, resultHandler);
    }
}
