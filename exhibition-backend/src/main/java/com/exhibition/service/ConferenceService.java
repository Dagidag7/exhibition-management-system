package com.exhibition.service;

import com.exhibition.model.Conference;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;

public interface ConferenceService {
    void registerConference(Conference conference, Handler<AsyncResult<Integer>> resultHandler);
    void listConferences(Handler<AsyncResult<List<Conference>>> resultHandler);
    void getConference(int id, Handler<AsyncResult<Conference>> resultHandler);
    void updateConference(Conference conference, Handler<AsyncResult<Void>> resultHandler);
    void removeConference(int id, Handler<AsyncResult<Void>> resultHandler);
    void isFloorConferenceTaken(String floorNumber, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler);
    void isSpeakerAssignedToConference(String speakerName, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler);
    void clearSpeakerFromConferences(String speakerName, Handler<AsyncResult<Void>> resultHandler);
}