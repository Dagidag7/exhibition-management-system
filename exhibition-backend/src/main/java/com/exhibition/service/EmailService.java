package com.exhibition.service;

import okhttp3.*;
import java.util.Properties;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;

public class EmailService {

	public static class EmailDeliveryException extends RuntimeException {
		public EmailDeliveryException(String message) {
			super(message);
		}

		public EmailDeliveryException(String message, Throwable cause) {
			super(message, cause);
		}
	}

	private final String smtpHost;
	private final int smtpPort;
	private final String smtpUsername;
	private final String smtpPassword;
	private final String fromAddress;
	private final String fromName;
	private final boolean useTls;
	private final String brevoApiKey;

	public static String getConfig(String key) {
		String value = System.getProperty(key);
		if (value == null || value.isBlank()) {
			value = System.getenv(key);
		}
		return value != null ? value.trim() : null;
	}

	public static int getIntConfig(String key, int defaultValue) {
		String value = getConfig(key);
		if (value == null || value.isBlank()) {
			return defaultValue;
		}
		try {
			return Integer.parseInt(value);
		} catch (NumberFormatException ignored) {
			return defaultValue;
		}
	}

	public EmailService(String smtpHost, int smtpPort, String smtpUsername, String smtpPassword, String fromAddress, boolean useTls) {
		// Determine email provider from environment
		// SMTP configuration
		this.smtpHost = smtpHost;
		this.smtpPort = smtpPort;
		this.smtpUsername = smtpUsername;
		this.smtpPassword = smtpPassword;
		this.useTls = useTls;
		
		this.fromAddress = fromAddress;
        this.fromName = "Exhibition Admin";

		this.brevoApiKey = getConfig("BREVO_API_KEY");
	}

	public void sendWelcomePassword(String recipientEmail, String companyName, String password) {
		String subject = "Welcome to the Exhibition Platform";
		String body = "Hello " + (companyName == null ? "Exhibitor" : companyName) + ",\n\n"
			+ "Your account has been created successfully.\n"
			+ "You can log in with the following temporary password:\n\n"
			+ "Password: " + password + "\n\n"
			+ "For security, please log in and change your password as soon as possible.\n\n"
			+ "Best regards,\nExhibition Admin";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendPasswordChanged(String recipientEmail, String companyName, String password) {
		String subject = "Your Exhibitor Password Has Been Updated";
		String body = "Hello " + (companyName == null ? "Exhibitor" : companyName) + ",\n\n"
			+ "Your account password has been set/updated by the administrator.\n\n"
			+ "New Password: " + password + "\n\n"
			+ "If you did not expect this change, please contact support immediately.\n\n"
			+ "Best regards,\nExhibition Admin";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendAttendeePasswordReset(String recipientEmail, String attendeeName, String newPassword) {
		String subject = "Your Exhibition Account Password Reset";
		String body = "Hello " + (attendeeName == null ? "Attendee" : attendeeName) + ",\n\n"
			+ "You requested a password reset for your exhibition account.\n\n"
			+ "Your new temporary password is: " + newPassword + "\n\n"
			+ "Please log in with this password and change it to something secure as soon as possible.\n\n"
			+ "If you did not request this password reset, please contact support immediately.\n\n"
			+ "Best regards,\nExhibition Team";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendExhibitorPasswordReset(String recipientEmail, String companyName, String newPassword) {
		String subject = "Your Exhibitor Account Password Reset";
		String body = "Hello " + (companyName == null ? "Exhibitor" : companyName) + ",\n\n"
			+ "You requested a password reset for your exhibitor account.\n\n"
			+ "Your new temporary password is: " + newPassword + "\n\n"
			+ "Please log in with this password and change it to something secure as soon as possible.\n\n"
			+ "If you did not request this password reset, please contact support immediately.\n\n"
			+ "Best regards,\nExhibition Team";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendAttendeeRegistrationReceipt(String recipientEmail, String name, String phone, Double amount, String paymentIntentId) {
		String receiptId = paymentIntentId != null && !paymentIntentId.isEmpty()
			? paymentIntentId.replace("pi_", "RCP-").substring(0, Math.min(20, paymentIntentId.length()))
			: "RCP-" + System.currentTimeMillis();
		String amountStr = amount != null ? String.format("%.2f", amount) : "0.00";

		String subject = "Exhibition Registration Receipt";
		String body = "EXHIBITION REGISTRATION RECEIPT\n"
			+ "================================\n\n"
			+ "Receipt ID: " + receiptId + "\n\n"
			+ "Attendee Information:\n"
			+ "  Name:  " + (name == null ? "" : name) + "\n"
			+ "  Email: " + (recipientEmail == null ? "" : recipientEmail) + "\n"
			+ "  Phone: " + (phone == null ? "" : phone) + "\n\n"
			+ "Payment Information:\n"
			+ "  Amount Paid: $" + amountStr + "\n"
			+ "  Payment ID: " + (paymentIntentId == null ? "" : paymentIntentId) + "\n\n"
			+ "This receipt confirms your registration and payment. Present this at the exhibition entrance.\n\n"
			+ "Best regards,\nExhibition Team";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendExhibitorPaymentRequest(String recipientEmail, String companyName, String paymentLink) {
		String subject = "Exhibitor Registration Payment Request";
		String body = "Dear " + (companyName == null || companyName.isEmpty() ? "Exhibitor" : companyName) + ",\n\n"
			+ "Thank you for registering as an exhibitor for our exhibition.\n\n"
			+ "To complete your registration, please process your payment using the secure link below:\n\n"
			+ paymentLink + "\n\n"
			+ "Once payment is confirmed, your booth assignment and additional details will be sent to you.\n\n"
			+ "If you have any questions or need assistance, please reply to this email.\n\n"
			+ "Best regards,\nExhibition Admin Team";

		sendEmail(recipientEmail, subject, body);
	}

	public void sendEmail(String recipientEmail,
                      String subject,
                      String body) {

    System.out.println("=================================================");
    System.out.println("Sending email");
    System.out.println("To: " + recipientEmail);
    System.out.println("Subject: " + subject);
    System.out.println("=================================================");

    sendViaBrevoApi(recipientEmail, subject, body);
}
	

	private void sendViaSMTP(String recipientEmail, String subject, String body) {
    if (smtpHost == null || smtpHost.isBlank()
            || fromAddress == null || fromAddress.isBlank()) {
        throw new EmailDeliveryException(
                "SMTP is not fully configured. Set SMTP_HOST and SMTP_FROM.");
    }

    if (smtpUsername == null || smtpUsername.isBlank()
            || smtpPassword == null || smtpPassword.isBlank()) {
        throw new EmailDeliveryException(
                "SMTP authentication is not configured.");
    }

    Properties props = new Properties();

    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.host", smtpHost);
    props.put("mail.smtp.port", String.valueOf(smtpPort));
    props.put("mail.smtp.connectiontimeout", "15000");
    props.put("mail.smtp.timeout", "20000");
    props.put("mail.smtp.writetimeout", "15000");
    props.put("mail.smtp.ssl.trust", smtpHost);
    props.put("mail.smtp.ssl.protocols", "TLSv1.2");

    // Port 465 = SSL
    if (smtpPort == 465) {
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.smtp.starttls.required", "false");
    }
    // Port 587 = STARTTLS
    else {
        props.put("mail.smtp.ssl.enable", "false");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
    }

    Session session = Session.getInstance(props,
            new jakarta.mail.Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(
                            smtpUsername,
                            smtpPassword
                    );
                }
            });

    // IMPORTANT: enable SMTP debug logs
    session.setDebug(true);
    session.setDebugOut(System.out);

    try {
        System.out.println("=================================");
        System.out.println("SMTP DEBUG");
        System.out.println("Host: " + smtpHost);
        System.out.println("Port: " + smtpPort);
        System.out.println("User: " + smtpUsername);
        System.out.println("From: " + fromAddress);
        System.out.println("STARTTLS: " + props.get("mail.smtp.starttls.enable"));
        System.out.println("SSL: " + props.get("mail.smtp.ssl.enable"));        System.out.println("=================================");

        Message message = new MimeMessage(session);

        message.setFrom(new InternetAddress(fromAddress));
        message.setRecipients(
                Message.RecipientType.TO,
                InternetAddress.parse(recipientEmail)
        );
        message.setSubject(subject);
        message.setText(body);

        System.out.println("Connecting to SMTP server...");
        Transport.send(message);

        System.out.println("=================================");
        System.out.println("EMAIL SENT SUCCESSFULLY");
        System.out.println("To: " + recipientEmail);
        System.out.println("Subject: " + subject);
        System.out.println("=================================");

    } catch (MessagingException e) {
        System.err.println("=================================");
        System.err.println("EMAIL SEND FAILED");
        System.err.println("To: " + recipientEmail);
        System.err.println("Error: " + e.getMessage());
        System.err.println("=================================");
        e.printStackTrace();

        throw new EmailDeliveryException(
                "Failed to send email: " + e.getMessage(),
                e
        );
    }
}
private void sendViaBrevoApi(String recipientEmail,
                             String subject,
                             String body) {

    if (brevoApiKey == null || brevoApiKey.isBlank()) {
        throw new EmailDeliveryException(
                "BREVO_API_KEY is not configured."
        );
    }

    try {
        OkHttpClient client = new OkHttpClient();

        String json =
                "{"
                        + "\"sender\":{"
                        + "\"name\":\"" + fromName + "\","
                        + "\"email\":\"" + fromAddress + "\""
                        + "},"
                        + "\"to\":[{"
                        + "\"email\":\"" + recipientEmail + "\""
                        + "}],"
                        + "\"subject\":\""
                        + subject.replace("\"", "\\\"")
                        + "\","
                        + "\"textContent\":\""
                        + body.replace("\"", "\\\"")
                              .replace("\n", "\\n")
                        + "\""
                        + "}";

        RequestBody requestBody =
                RequestBody.create(
                        json,
                        MediaType.parse("application/json")
                );

        Request request =
                new Request.Builder()
                        .url("https://api.brevo.com/v3/smtp/email")
                        .addHeader("accept", "application/json")
                        .addHeader("api-key", brevoApiKey)
                        .addHeader("Content-Type", "application/json")
                        .post(requestBody)
                        .build();

        try (Response response =
                     client.newCall(request).execute()) {

            if (response.isSuccessful()) {

                System.out.println("=================================");
                System.out.println("EMAIL SENT SUCCESSFULLY");
                System.out.println("To: " + recipientEmail);
                System.out.println("Status: " + response.code());
                System.out.println("=================================");

            } else {

                String error =
                        response.body() != null
                                ? response.body().string()
                                : "";

                throw new EmailDeliveryException(
                        "Brevo API returned "
                                + response.code()
                                + ": "
                                + error
                );
            }
        }

    } catch (Exception e) {

        e.printStackTrace();

        throw new EmailDeliveryException(
                "Failed to send email via Brevo API: "
                        + e.getMessage(),
                e
        );
    }
}

	private static String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value.trim();
			}
		}
		return null;
	}

	private String buildSmtpFailureMessage() {
		if (smtpHost != null && smtpHost.toLowerCase().contains("brevo")) {
			return "Brevo SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD in .env and make sure the password is a valid Brevo SMTP key.";
		}
		return "SMTP authentication failed. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM.";
	}
}
