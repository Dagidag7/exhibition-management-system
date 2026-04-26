package com.exhibition.service;

import com.exhibition.model.Exhibitor;
import com.exhibition.model.Attendee;
import com.exhibition.repository.ExhibitorRepository;
import com.exhibition.repository.AttendeeRepository;
import com.exhibition.repository.AttendeeRepositoryImpl;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;
import org.mindrot.jbcrypt.BCrypt;

public class ExhibitorServiceImpl implements ExhibitorService {

    private final ExhibitorRepository exhibitorRepository;
    private final AttendeeRepository attendeeRepository;
    private final EmailService emailService;

    public ExhibitorServiceImpl(ExhibitorRepository exhibitorRepository) {
        this.exhibitorRepository = exhibitorRepository;
        this.attendeeRepository = new AttendeeRepositoryImpl();
        
        String smtpHost = EmailService.getConfig("SMTP_HOST");
        if (smtpHost == null || smtpHost.isBlank()) {
            smtpHost = "smtp.gmail.com";
        }
        
        int smtpPort = EmailService.getIntConfig("SMTP_PORT", 587);
        String smtpUser = EmailService.getConfig("SMTP_USER");
        String smtpPass = EmailService.getConfig("SMTP_PASSWORD");
        String from = EmailService.getConfig("SMTP_FROM");
        if (from == null || from.isBlank()) {
            from = smtpUser;
        }
        
        String useTlsStr = EmailService.getConfig("SMTP_USE_TLS");
        boolean useTls = !"false".equalsIgnoreCase(useTlsStr);
        
        this.emailService = new EmailService(smtpHost, smtpPort, smtpUser, smtpPass, from, useTls);
        System.out.println("EmailService initialized (SMTP_HOST=" + smtpHost + ", SMTP_PORT=" + smtpPort + ", SMTP_USER=" + smtpUser + ")");
    }

    @Override
    public void registerExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Integer>> resultHandler) {
        String floor = exhibitor.getFloorNumber() == null ? null : exhibitor.getFloorNumber().trim();
	    String booth = exhibitor.getBoothNumber() == null ? null : exhibitor.getBoothNumber().trim();
        String email = exhibitor.getEmail() == null ? null : exhibitor.getEmail().trim().toLowerCase();
        
        // Check if email already exists
        if (email != null && !email.isEmpty()) {
            exhibitorRepository.getExhibitorByEmail(email, emailCheckRes -> {
                if (emailCheckRes.succeeded() && emailCheckRes.result() != null) {
                    // Email already exists
                    resultHandler.handle(io.vertx.core.Future.failedFuture("Email already exists. Each exhibitor must have a unique email address."));
                    return;
                }
                
                // Email is unique, continue with registration
                continueRegistration(exhibitor, floor, booth, resultHandler);
            });
        } else {
            // No email provided, continue with registration
            continueRegistration(exhibitor, floor, booth, resultHandler);
        }
    }
    
    private void continueRegistration(Exhibitor exhibitor, String floor, String booth, Handler<AsyncResult<Integer>> resultHandler) {
        exhibitorRepository.isBoothTaken(floor, booth, null, takenRes -> {
            if (takenRes.failed()) {
                resultHandler.handle(io.vertx.core.Future.failedFuture(takenRes.cause()));
                return;
            }
            if (Boolean.TRUE.equals(takenRes.result())) {
                resultHandler.handle(io.vertx.core.Future.failedFuture("Booth number already exists. Each booth number must be unique across the entire exhibition."));
                return;
            }
            
            exhibitorRepository.getFloorExhibitorCount(floor, countRes -> {
                if (countRes.failed()) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture(countRes.cause()));
                    return;
                }
                int currentCount = countRes.result();
                if (currentCount >= 10) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture("Floor capacity exceeded. Maximum 10 exhibitors allowed per floor."));
                    return;
                }

                exhibitor.setFloorNumber(floor);
                exhibitor.setBoothNumber(booth);

                // Set initial password, hash it before persisting
                String initialPassword = "Welcome123";
                String hashedInitialPassword = BCrypt.hashpw(initialPassword, BCrypt.gensalt(12));
                exhibitor.setPassword(hashedInitialPassword);

                exhibitorRepository.addExhibitor(exhibitor, ar -> {
                    if (ar.succeeded()) {
                        // Send welcome email with initial password in a separate thread to not block the main flow
                        com.exhibition.MainVerticle.vertx.executeBlocking(emailPromise -> {
                            try {
                                System.out.println("=".repeat(60));
                                System.out.println("SENDING WELCOME EMAIL TO NEW EXHIBITOR");
                                System.out.println("  Email: " + exhibitor.getEmail());
                                System.out.println("  Company: " + exhibitor.getCompanyName());
                                System.out.println("  Password: Welcome123");
                                System.out.println("=".repeat(60));

                                emailService.sendWelcomePassword(exhibitor.getEmail(), exhibitor.getCompanyName(), initialPassword);
                                emailPromise.complete("Email sent successfully");
                            } catch (Exception e) {
                                System.err.println("=".repeat(60));
                                System.err.println("FAILED TO SEND WELCOME EMAIL");
                                System.err.println("  Email: " + exhibitor.getEmail());
                                System.err.println("  Error: " + e.getMessage());
                                System.err.println("=".repeat(60));
                                e.printStackTrace();
                                emailPromise.fail(e);
                            }
                        }, emailRes -> {
                            if (emailRes.succeeded()) {
                                System.out.println("Welcome email process completed for: " + exhibitor.getEmail());
                            } else {
                                System.err.println("Welcome email process failed for: " + exhibitor.getEmail());
                            }
                        });
                    }
                    // Registration succeeds even if email fails
                    resultHandler.handle(ar);
                });
            });
        });
    }

    @Override
    public void getExhibitor(int id, Handler<AsyncResult<Exhibitor>> resultHandler) {
        exhibitorRepository.getExhibitorById(id, resultHandler);
    }

    @Override
    public void listExhibitors(Handler<AsyncResult<List<Exhibitor>>> resultHandler) {
        exhibitorRepository.getAllExhibitors(resultHandler);
    }

    @Override
    public void updateExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Void>> resultHandler) {
        String floor = exhibitor.getFloorNumber() == null ? null : exhibitor.getFloorNumber().trim();
	    String booth = exhibitor.getBoothNumber() == null ? null : exhibitor.getBoothNumber().trim();
        String email = exhibitor.getEmail() == null ? null : exhibitor.getEmail().trim().toLowerCase();
        
        // Check if email is being changed to one that already exists
        if (email != null && !email.isEmpty()) {
            exhibitorRepository.getExhibitorByEmail(email, emailCheckRes -> {
                if (emailCheckRes.succeeded() && emailCheckRes.result() != null) {
                    // Email exists - check if it belongs to a different exhibitor
                    Exhibitor existingExhibitor = emailCheckRes.result();
                    if (existingExhibitor.getExhibitorId() != exhibitor.getExhibitorId()) {
                        // Email belongs to a different exhibitor
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Email already exists. Each exhibitor must have a unique email address."));
                        return;
                    }
                }
                
                // Email is unique or belongs to the same exhibitor, continue with update
                continueUpdate(exhibitor, floor, booth, resultHandler);
            });
        } else {
            // No email provided, continue with update
            continueUpdate(exhibitor, floor, booth, resultHandler);
        }
    }
    
    private void continueUpdate(Exhibitor exhibitor, String floor, String booth, Handler<AsyncResult<Void>> resultHandler) {
        exhibitorRepository.isBoothTaken(floor, booth, exhibitor.getExhibitorId(), takenRes -> {
            if (takenRes.failed()) {
                resultHandler.handle(io.vertx.core.Future.failedFuture(takenRes.cause()));
                return;
            }
            if (Boolean.TRUE.equals(takenRes.result())) {
                resultHandler.handle(io.vertx.core.Future.failedFuture("Booth number already exists. Each booth number must be unique across the entire exhibition."));
                return;
            }
            
            exhibitorRepository.getFloorExhibitorCount(floor, countRes -> {
                if (countRes.failed()) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture(countRes.cause()));
                    return;
                }
                int currentCount = countRes.result();
                if (currentCount >= 10) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture("Floor capacity exceeded. Maximum 10 exhibitors allowed per floor."));
                    return;
                }
                
                exhibitor.setFloorNumber(floor);
                exhibitor.setBoothNumber(booth);
                exhibitorRepository.updateExhibitor(exhibitor, resultHandler);
            });
        });
    }

    @Override
    public void removeExhibitor(int id, Handler<AsyncResult<Void>> resultHandler) {
        exhibitorRepository.deleteExhibitor(id, resultHandler);
    }
    
    @Override
    public void updateExhibitorPassword(int exhibitorId, String password, Handler<AsyncResult<Void>> resultHandler) {
        // When user changes password, clear the temporary password flag
        String effectivePassword = password;
        if (effectivePassword != null && !effectivePassword.isBlank()) {
            effectivePassword = BCrypt.hashpw(effectivePassword.trim(), BCrypt.gensalt(12));
        }

        exhibitorRepository.updateExhibitorPasswordWithTemporaryFlag(exhibitorId, effectivePassword, false, ar -> {
            if (ar.succeeded()) {
                exhibitorRepository.getExhibitorById(exhibitorId, fetchRes -> {
                    if (fetchRes.succeeded() && fetchRes.result() != null) {
                        try {
                            emailService.sendPasswordChanged(fetchRes.result().getEmail(), fetchRes.result().getCompanyName(), password);
                        } catch (Exception ignored) {}
                    }
                });
            }
            resultHandler.handle(ar);
        });
    }
    
    @Override
    public void getExhibitorByEmail(String email, Handler<AsyncResult<Exhibitor>> resultHandler) {
        exhibitorRepository.getExhibitorByEmail(email, resultHandler);
    }
    
    @Override
    public void getFloorExhibitorCount(String floorNumber, Handler<AsyncResult<Integer>> resultHandler) {
        exhibitorRepository.getFloorExhibitorCount(floorNumber, resultHandler);
    }
    
    @Override
    public void resetExhibitorPassword(String email, Handler<AsyncResult<String>> resultHandler) {
        System.out.println("Password reset requested for email: " + email);
        
        // First, try to find the exhibitor by email
        exhibitorRepository.getExhibitorByEmail(email, ar -> {
            if (ar.succeeded() && ar.result() != null) {
                // Found exhibitor
                System.out.println("Found exhibitor for email: " + email);
                Exhibitor exhibitor = ar.result();
                String newPassword = generateTemporaryPassword();

                // Hash the new temporary password before storing
                String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt(12));
                exhibitor.setPassword(hashed);
                exhibitor.setTemporaryPassword(true);
                exhibitor.setPasswordChanged(false);
                exhibitorRepository.updateExhibitorPasswordWithTemporaryFlag(exhibitor.getExhibitorId(), hashed, true, updateRes -> {
                    if (updateRes.succeeded()) {
                        System.out.println("Password updated successfully for exhibitor: " + exhibitor.getEmail());
                        
                        // Send password reset email in a separate blocking thread
                        com.exhibition.MainVerticle.vertx.executeBlocking(emailPromise -> {
                            try {
                                System.out.println("=".repeat(60));
                                System.out.println("SENDING PASSWORD RESET EMAIL TO EXHIBITOR");
                                System.out.println("  Email: " + exhibitor.getEmail());
                                System.out.println("  Company: " + exhibitor.getCompanyName());
                                System.out.println("  New Password: " + newPassword);
                                System.out.println("=".repeat(60));
                                
                                emailService.sendExhibitorPasswordReset(exhibitor.getEmail(), exhibitor.getCompanyName(), newPassword);
                                emailPromise.complete("Email sent");
                            } catch (Exception e) {
                                System.err.println("=".repeat(60));
                                System.err.println("PASSWORD RESET EMAIL FAILED");
                                System.err.println("  Email: " + exhibitor.getEmail());
                                System.err.println("  Error: " + e.getMessage());
                                System.err.println("=".repeat(60));
                                e.printStackTrace();
                                emailPromise.fail(e);
                            }
                        }, emailRes -> {
                            // Password was updated regardless of email result
                            if (emailRes.succeeded()) {
                                resultHandler.handle(io.vertx.core.Future.succeededFuture("Password reset email sent successfully. Temporary password: " + newPassword));
                            } else {
                                // Email failed but password was updated
                                resultHandler.handle(io.vertx.core.Future.succeededFuture("Password reset completed but email could not be sent. Temporary password: " + newPassword));
                            }
                        });
                    } else {
                        System.err.println("Failed to update password: " + updateRes.cause().getMessage());
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Failed to update password: " + updateRes.cause().getMessage()));
                    }
                });
            } else {
                // Exhibitor not found, try attendee
                System.out.println("Exhibitor not found, checking attendees for email: " + email);
                attendeeRepository.getAttendeeByEmail(email, attendeeAr -> {
                    if (attendeeAr.succeeded() && attendeeAr.result() != null) {
                        // Found attendee
                        System.out.println("Found attendee for email: " + email);
                        Attendee attendee = attendeeAr.result();
                        String newPassword = generateTemporaryPassword();

                        // Hash the new temporary password before storing
                        String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt(12));
                        attendee.setPassword(hashed);
                        attendee.setTemporaryPassword(true);
                        attendeeRepository.updateAttendeePasswordWithTemporaryFlag(attendee.getAttendeeId(), hashed, true, updateRes -> {
                            if (updateRes.succeeded()) {
                                // Send password reset email in a separate blocking thread
                                com.exhibition.MainVerticle.vertx.executeBlocking(emailPromise -> {
                                    try {
                                        System.out.println("=".repeat(60));
                                        System.out.println("SENDING PASSWORD RESET EMAIL TO ATTENDEE");
                                        System.out.println("  Email: " + attendee.getEmail());
                                        System.out.println("  Name: " + attendee.getName());
                                        System.out.println("  New Password: " + newPassword);
                                        System.out.println("=".repeat(60));
                                        
                                        emailService.sendAttendeePasswordReset(attendee.getEmail(), attendee.getName(), newPassword);
                                        emailPromise.complete("Email sent");
                                    } catch (Exception e) {
                                        System.err.println("=".repeat(60));
                                        System.err.println("ATTENDEE PASSWORD RESET EMAIL FAILED");
                                        System.err.println("  Email: " + attendee.getEmail());
                                        System.err.println("  Error: " + e.getMessage());
                                        System.err.println("=".repeat(60));
                                        e.printStackTrace();
                                        emailPromise.fail(e);
                                    }
                                }, emailRes -> {
                                    // Password was updated regardless of email result
                                    if (emailRes.succeeded()) {
                                        resultHandler.handle(io.vertx.core.Future.succeededFuture("Password reset email sent successfully. Temporary password: " + newPassword));
                                    } else {
                                        // Email failed but password was updated
                                        resultHandler.handle(io.vertx.core.Future.succeededFuture("Password reset completed but email could not be sent. Temporary password: " + newPassword));
                                    }
                                });
                            } else {
                                resultHandler.handle(io.vertx.core.Future.failedFuture("Failed to update password: " + updateRes.cause().getMessage()));
                            }
                        });
                    } else {
                        // Neither exhibitor nor attendee found
                        System.out.println("Neither exhibitor nor attendee found for email: " + email);
                        resultHandler.handle(io.vertx.core.Future.succeededFuture("If the email exists in our system, a password reset will be sent."));
                    }
                });
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
    public void sendPaymentRequestEmail(String email, String companyName, String paymentLink, Handler<AsyncResult<Void>> resultHandler) {
        com.exhibition.MainVerticle.vertx.executeBlocking(emailPromise -> {
            try {
                System.out.println("=".repeat(60));
                System.out.println("SENDING PAYMENT REQUEST EMAIL TO EXHIBITOR");
                System.out.println("  Email: " + email);
                System.out.println("  Company: " + companyName);
                System.out.println("  Payment Link: " + paymentLink);
                System.out.println("=".repeat(60));
                
                emailService.sendExhibitorPaymentRequest(email, companyName, paymentLink);
                emailPromise.complete("Email sent successfully");
            } catch (Exception e) {
                System.err.println("=".repeat(60));
                System.err.println("PAYMENT REQUEST EMAIL FAILED");
                System.err.println("  Email: " + email);
                System.err.println("  Error: " + e.getMessage());
                System.err.println("=".repeat(60));
                e.printStackTrace();
                emailPromise.fail(e);
            }
        }, emailRes -> {
            if (emailRes.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(emailRes.cause()));
            }
        });
    }
}
