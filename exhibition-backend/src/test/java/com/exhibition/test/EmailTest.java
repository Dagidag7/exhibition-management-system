package com.exhibition.test;

import com.exhibition.service.EmailService;

public class EmailTest {
    public static void main(String[] args) {
        String smtpHost = "smtp.gmail.com";
        int smtpPort = 587;
        String smtpUser = "dagimawitkelem129@gmail.com";
        String smtpPass = "ostr pjer kczl kgaw";
        String from = "dagimawitkelem129@gmail.com";
        boolean useTls = true;
        
        EmailService emailService = new EmailService(smtpHost, smtpPort, smtpUser, smtpPass, from, useTls);
        
        System.out.println("Testing email service...");
        try {
            emailService.sendEmail("dagimawitkelem129@gmail.com", "Test Email", "This is a test email from the exhibition system.");
            System.out.println("Test email sent successfully!");
        } catch (Exception e) {
            System.err.println("Test email failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
