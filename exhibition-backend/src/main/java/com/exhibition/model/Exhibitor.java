package com.exhibition.model;

import java.time.LocalDateTime;

public class Exhibitor {
    private int exhibitorId;
    private String companyName;
    private String contactPerson;
    private String email;
    private String boothNumber;
    private String productIds;
    private String password;
    private String logoUrl;
    private String floorNumber;
    private String status;
    private boolean passwordChanged;
    private boolean isTemporaryPassword;
    private LocalDateTime registrationDate;

    public Exhibitor() {}

    public Exhibitor(String companyName, String contactPerson, String email, String boothNumber, String floorNumber) {
        this.companyName = companyName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.boothNumber = boothNumber;
        this.floorNumber = floorNumber;
        this.registrationDate = LocalDateTime.now();
    }

    public int getExhibitorId() {
        return exhibitorId;
    }

    public void setExhibitorId(int exhibitorId) {
        this.exhibitorId = exhibitorId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBoothNumber() {
        return boothNumber;
    }

    public void setBoothNumber(String boothNumber) {
        this.boothNumber = boothNumber;
    }

    public String getProductIds() {
        return productIds;
    }

    public void setProductIds(String productIds) {
        this.productIds = productIds;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(String floorNumber) {
        this.floorNumber = floorNumber;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isPasswordChanged() {
        return passwordChanged;
    }

    public void setPasswordChanged(boolean passwordChanged) {
        this.passwordChanged = passwordChanged;
    }

    public boolean isTemporaryPassword() {
        return isTemporaryPassword;
    }

    public void setTemporaryPassword(boolean temporaryPassword) {
        isTemporaryPassword = temporaryPassword;
    }
}