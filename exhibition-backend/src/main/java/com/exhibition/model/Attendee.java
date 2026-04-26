package com.exhibition.model;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Attendee {
    private int attendeeId;
    private String name;
    private String email;
    private String phone;
    private String password;
    private String registrationDate;
    private String sessionIds;
    private String status;
    private boolean isTemporaryPassword;
    private String profilePhoto;
    private Double paymentFee;
    private String paymentIntentId; // Transient - for receipt email, not persisted

    public Attendee() {
        this.registrationDate = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        this.sessionIds = ""; 
        this.status = "active";
    }

    public int getAttendeeId() { return attendeeId; }
    public void setAttendeeId(int attendeeId) { this.attendeeId = attendeeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRegistrationDate() { return registrationDate; }
    
    public void setRegistrationDate(String registrationDate) { 
        this.registrationDate = registrationDate; 
    }

    public String getSessionIds() { return sessionIds; }
    public void setSessionIds(String sessionIds) { this.sessionIds = sessionIds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isTemporaryPassword() { return isTemporaryPassword; }
    public void setTemporaryPassword(boolean temporaryPassword) { this.isTemporaryPassword = temporaryPassword; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public Double getPaymentFee() { return paymentFee; }
    public void setPaymentFee(Double paymentFee) { this.paymentFee = paymentFee; }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
}