package com.exhibition.repository;

import com.exhibition.MainVerticle;
import com.exhibition.model.Conference;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.UpdateResult;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ConferenceRepositoryImpl implements ConferenceRepository {
    private final SQLClient jdbcClient;

    public ConferenceRepositoryImpl(SQLClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public void addConference(Conference conference, Handler<AsyncResult<Integer>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                    String sql = "INSERT INTO conference (title, description, date, time, floor_number, speaker) VALUES (?, ?, ?, ?, ?, ?)";
                    JsonArray params = new JsonArray()
                        .add(conference.getTitle())
                        .add(conference.getDescription())
                        .add(conference.getDate())
                        .add(conference.getTime())
                        .add(conference.getFloorNumber())
                        .add(conference.getSpeaker());

                jdbcClient.updateWithParams(sql, params, res -> {
                    if (res.succeeded()) {
                        UpdateResult result = res.result();
                        promise.complete(result.getKeys().getInteger(0));
                    } else {
                        promise.fail(res.cause());
                    }
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }

    @Override
    public void getAllConferences(Handler<AsyncResult<List<Conference>>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                    String sql = "SELECT conference_id, title, description, date, time, floor_number, speaker FROM conference ORDER BY date, time";
                jdbcClient.query(sql, res -> {
                    if (res.succeeded()) {
                        ResultSet resultSet = res.result();
                        List<Conference> conferences = new ArrayList<>();
                        
                        for (JsonArray row : resultSet.getResults()) {
                            Conference conference = mapRowToConference(row);
                            conferences.add(conference);
                        }
                        
                        promise.complete(conferences);
                    } else {
                        promise.fail(res.cause());
                    }
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }

    @Override
    public void getConference(int id, Handler<AsyncResult<Conference>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                    String sql = "SELECT conference_id, title, description, date, time, floor_number, speaker FROM conference WHERE conference_id = ?";
                JsonArray params = new JsonArray().add(id);
                
                jdbcClient.queryWithParams(sql, params, res -> {
                    if (res.succeeded()) {
                        ResultSet resultSet = res.result();
                        if (resultSet.getResults().isEmpty()) {
                            promise.fail(new RuntimeException("Conference not found"));
                        } else {
                            Conference conference = mapRowToConference(resultSet.getResults().get(0));
                            promise.complete(conference);
                        }
                    } else {
                        promise.fail(res.cause());
                    }
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }

    @Override
    public void updateConference(Conference conference, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                    String sql = "UPDATE conference SET title = ?, description = ?, date = ?, time = ?, floor_number = ?, speaker = ? WHERE conference_id = ?";
                    JsonArray params = new JsonArray()
                        .add(conference.getTitle())
                        .add(conference.getDescription())
                        .add(conference.getDate())
                        .add(conference.getTime())
                        .add(conference.getFloorNumber())
                        .add(conference.getSpeaker())
                        .add(conference.getConferenceId());

                jdbcClient.updateWithParams(sql, params, res -> {
                    if (res.succeeded()) {
                        promise.complete();
                    } else {
                        promise.fail(res.cause());
                    }
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }

    @Override
    public void deleteConference(int id, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "DELETE FROM conference WHERE conference_id = ?";
                JsonArray params = new JsonArray().add(id);
                
                jdbcClient.updateWithParams(sql, params, res -> {
                    if (res.succeeded()) {
                        promise.complete();
                    } else {
                        promise.fail(res.cause());
                    }
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }

    private Conference mapRowToConference(JsonArray row) {
        Conference conference = new Conference();
        conference.setConferenceId(row.getInteger(0));
        conference.setTitle(row.getString(1));
        conference.setDescription(row.getString(2));
        conference.setDate(row.getString(3));
        conference.setTime(row.getString(4));
        conference.setFloorNumber(row.getString(5));
        conference.setSpeaker(row.getString(6));
        return conference;
    }
    
    public void isFloorConferenceTaken(String floorNumber, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler) {
        // Normalize floor number for comparison (remove spaces, convert to lowercase)
        String normalizedFloorNumber = floorNumber == null ? null : floorNumber.trim().toLowerCase().replaceAll("\\s+", "");
        
        String sql = excludeConferenceId == null
            ? "SELECT 1 FROM conference WHERE LOWER(REPLACE(REPLACE(floor_number, ' ', ''), '\t', '')) = ? LIMIT 1"
            : "SELECT 1 FROM conference WHERE LOWER(REPLACE(REPLACE(floor_number, ' ', ''), '\t', '')) = ? AND conference_id <> ? LIMIT 1";

        JsonArray params = excludeConferenceId == null
            ? new JsonArray().add(normalizedFloorNumber)
            : new JsonArray().add(normalizedFloorNumber).add(excludeConferenceId);

        jdbcClient.queryWithParams(sql, params, res -> {
            if (res.succeeded()) {
                boolean taken = res.result().getNumRows() > 0;
                resultHandler.handle(io.vertx.core.Future.succeededFuture(taken));
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }
    
    public void isSpeakerAssignedToConference(String speakerName, Integer excludeConferenceId, Handler<AsyncResult<Boolean>> resultHandler) {
        String sql = excludeConferenceId == null
            ? "SELECT 1 FROM conference WHERE speaker = ? LIMIT 1"
            : "SELECT 1 FROM conference WHERE speaker = ? AND conference_id <> ? LIMIT 1";

        JsonArray params = excludeConferenceId == null
            ? new JsonArray().add(speakerName == null ? null : speakerName.trim())
            : new JsonArray().add(speakerName == null ? null : speakerName.trim())
                             .add(excludeConferenceId);

        jdbcClient.queryWithParams(sql, params, res -> {
            if (res.succeeded()) {
                boolean assigned = res.result().getNumRows() > 0;
                resultHandler.handle(io.vertx.core.Future.succeededFuture(assigned));
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void clearSpeakerFromConferences(String speakerName, Handler<AsyncResult<Void>> resultHandler) {
        if (speakerName == null || speakerName.trim().isEmpty()) {
            resultHandler.handle(io.vertx.core.Future.succeededFuture());
            return;
        }
        String sql = "UPDATE conference SET speaker = NULL WHERE TRIM(COALESCE(speaker, '')) = ?";
        JsonArray params = new JsonArray().add(speakerName.trim());
        jdbcClient.updateWithParams(sql, params, res -> {
            if (res.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }
}
