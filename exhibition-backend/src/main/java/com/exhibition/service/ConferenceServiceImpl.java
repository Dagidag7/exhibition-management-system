package com.exhibition.service;

import com.exhibition.model.Conference;
import com.exhibition.repository.ConferenceRepository;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;

public class ConferenceServiceImpl implements ConferenceService {
    private final ConferenceRepository conferenceRepository;

    public ConferenceServiceImpl(ConferenceRepository conferenceRepository) {
        this.conferenceRepository = conferenceRepository;
    }

    @Override
    public void registerConference(Conference conference, Handler<AsyncResult<Integer>> resultHandler) {
        String floor = conference.getFloorNumber() == null ? null : conference.getFloorNumber().trim();
        String speaker = conference.getSpeaker() == null ? null : conference.getSpeaker().trim();
        
        conferenceRepository.isFloorConferenceTaken(floor, null, takenRes -> {
            if (takenRes.failed()) {
                resultHandler.handle(io.vertx.core.Future.failedFuture(takenRes.cause()));
                return;
            }
            if (Boolean.TRUE.equals(takenRes.result())) {
                resultHandler.handle(io.vertx.core.Future.failedFuture("Floor already has a conference. Only one conference allowed per floor."));
                return;
            }
            
            conferenceRepository.isSpeakerAssignedToConference(speaker, null, speakerRes -> {
                if (speakerRes.failed()) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture(speakerRes.cause()));
                    return;
                }
                if (Boolean.TRUE.equals(speakerRes.result())) {
                    resultHandler.handle(io.vertx.core.Future.failedFuture("Speaker is already assigned to another conference. One speaker per conference only."));
                    return;
                }
                
                conference.setFloorNumber(floor);
                conference.setSpeaker(speaker);
                conferenceRepository.addConference(conference, resultHandler);
            });
        });
    }

    @Override
    public void listConferences(Handler<AsyncResult<List<Conference>>> resultHandler) {
        conferenceRepository.getAllConferences(resultHandler);
    }

    @Override
    public void getConference(int id, Handler<AsyncResult<Conference>> resultHandler) {
        conferenceRepository.getConference(id, resultHandler);
    }

    @Override
    public void updateConference(Conference conference, Handler<AsyncResult<Void>> resultHandler) {
        String floor = conference.getFloorNumber() == null ? null : conference.getFloorNumber().trim();
        String speaker = conference.getSpeaker() == null ? null : conference.getSpeaker().trim();
        
        conferenceRepository.isFloorConferenceTaken(floor, conference.getConferenceId(), takenRes -> {
            if (takenRes.failed()) {
                resultHandler.handle(io.vertx.core.Future.failedFuture(takenRes.cause()));
                return;
            }
            if (Boolean.TRUE.equals(takenRes.result())) {
                resultHandler.handle(io.vertx.core.Future.failedFuture("Floor already has a conference. Only one conference allowed per floor."));
                return;
            }
            
            if (speaker == null || speaker.isEmpty()) {
                conference.setFloorNumber(floor);
                conference.setSpeaker(speaker);
                conferenceRepository.updateConference(conference, resultHandler);
            } else {
                conferenceRepository.isSpeakerAssignedToConference(speaker, conference.getConferenceId(), speakerRes -> {
                    if (speakerRes.failed()) {
                        resultHandler.handle(io.vertx.core.Future.failedFuture(speakerRes.cause()));
                        return;
                    }
                    if (Boolean.TRUE.equals(speakerRes.result())) {
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Speaker is already assigned to another conference. One speaker per conference only."));
                        return;
                    }
                    conference.setFloorNumber(floor);
                    conference.setSpeaker(speaker);
                    conferenceRepository.updateConference(conference, resultHandler);
                });
            }
        });
    }

    @Override
    public void removeConference(int id, Handler<AsyncResult<Void>> resultHandler) {
        conferenceRepository.deleteConference(id, resultHandler);
    }
    
    @Override
    public void isFloorConferenceTaken(String floorNumber, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler) {
        conferenceRepository.isFloorConferenceTaken(floorNumber, excludeConferenceId, resultHandler);
    }
    
    @Override
    public void isSpeakerAssignedToConference(String speakerName, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler) {
        conferenceRepository.isSpeakerAssignedToConference(speakerName, excludeConferenceId, resultHandler);
    }

    @Override
    public void clearSpeakerFromConferences(String speakerName, Handler<AsyncResult<Void>> resultHandler) {
        conferenceRepository.clearSpeakerFromConferences(speakerName, resultHandler);
    }
}