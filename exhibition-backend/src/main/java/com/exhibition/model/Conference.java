package com.exhibition.model;

public class Conference {
    private int conferenceId;
    private String title;
    private String description;
    private String date;
    private String time;
    private String floorNumber;
    private String speaker;

    // Default constructor
    public Conference() {}

    // Constructor with all fields
    public Conference(int conferenceId, String title, String description, 
    String date, String time, String floorNumber, String speaker) {
        this.conferenceId = conferenceId;
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
        this.floorNumber = floorNumber;
        this.speaker = speaker;
    }

    // Getters and Setters
    public int getConferenceId() {
        return conferenceId;
    }

    public void setConferenceId(int conferenceId) {
        this.conferenceId = conferenceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(String floorNumber) {
        this.floorNumber = floorNumber;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    @Override
    public String toString() {
        return "Conference{" +
                "conferenceId=" + conferenceId +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", date='" + date + '\'' +
                ", time='" + time + '\'' +
                ", floorNumber='" + floorNumber + '\'' +
                ", speaker='" + speaker + '\'' +
                '}';
    }
}