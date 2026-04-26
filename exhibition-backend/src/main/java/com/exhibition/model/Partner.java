package com.exhibition.model;

public class Partner {
    private int partnerId;
    private String name;
    private String contactPerson;
    private String email;
    private String partnershipType;
    private String benefits;

    public Partner() {
    }

    public int getPartnerId() { return partnerId; }
    public void setPartnerId(int partnerId) { this.partnerId = partnerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPartnershipType() { return partnershipType; }
    public void setPartnershipType(String partnershipType) { this.partnershipType = partnershipType; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
}