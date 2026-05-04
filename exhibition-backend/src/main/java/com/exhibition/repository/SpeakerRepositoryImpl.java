package com.exhibition.repository;

import com.exhibition.MainVerticle;
import com.exhibition.model.Speaker;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.UpdateResult;
import java.util.ArrayList;
import java.util.List;

public class SpeakerRepositoryImpl implements SpeakerRepository {
    private final SQLClient jdbcClient;

    public SpeakerRepositoryImpl(SQLClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    @Override
    public void addSpeaker(Speaker speaker, Handler<AsyncResult<Integer>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            String sql = "INSERT INTO speaker (name, bio, expertise, email, phone, organization) VALUES (?, ?, ?, ?, ?, ?)";
            JsonArray params = new JsonArray()
                .add(speaker.getName())
                .add(speaker.getBio())
                .add(speaker.getExpertise())
                .add(speaker.getEmail())
                .add(speaker.getPhone())
                .add(speaker.getOrganization());
            jdbcClient.updateWithParams(sql, params, res -> {
                if (res.succeeded()) {
                    UpdateResult result = res.result();
                    promise.complete(result.getKeys().getInteger(0));
                } else {
                    promise.fail(res.cause());
                }
            });
        }, resultHandler);
    }

    @Override
    public void getAllSpeakers(Handler<AsyncResult<List<Speaker>>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            String sql = "SELECT speaker_id, name, bio, expertise, email, phone, organization FROM speaker ORDER BY name";
            jdbcClient.query(sql, res -> {
                if (res.succeeded()) {
                    ResultSet resultSet = res.result();
                    List<Speaker> speakers = new ArrayList<>();
                    for (JsonArray row : resultSet.getResults()) {
                        speakers.add(mapRowToSpeaker(row));
                    }
                    promise.complete(speakers);
                } else {
                    promise.fail(res.cause());
                }
            });
        }, resultHandler);
    }

    @Override
    public void getSpeaker(int id, Handler<AsyncResult<Speaker>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            String sql = "SELECT speaker_id, name, bio, expertise, email, phone, organization FROM speaker WHERE speaker_id = ?";
            JsonArray params = new JsonArray().add(id);
            jdbcClient.queryWithParams(sql, params, res -> {
                if (res.succeeded()) {
                    ResultSet resultSet = res.result();
                    if (resultSet.getResults().isEmpty()) {
                        promise.fail(new RuntimeException("Speaker not found"));
                    } else {
                        promise.complete(mapRowToSpeaker(resultSet.getResults().get(0)));
                    }
                } else {
                    promise.fail(res.cause());
                }
            });
        }, resultHandler);
    }

    @Override
    public void updateSpeaker(Speaker speaker, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            String sql = "UPDATE speaker SET name = ?, bio = ?, expertise = ?, email = ?, phone = ?, organization = ? WHERE speaker_id = ?";
            JsonArray params = new JsonArray()
                .add(speaker.getName())
                .add(speaker.getBio())
                .add(speaker.getExpertise())
                .add(speaker.getEmail())
                .add(speaker.getPhone())
                .add(speaker.getOrganization())
                .add(speaker.getSpeakerId());
            jdbcClient.updateWithParams(sql, params, res -> {
                if (res.succeeded()) {
                    promise.complete();
                } else {
                    promise.fail(res.cause());
                }
            });
        }, resultHandler);
    }

    @Override
    public void deleteSpeaker(int id, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            String sql = "DELETE FROM speaker WHERE speaker_id = ?";
            JsonArray params = new JsonArray().add(id);
            jdbcClient.updateWithParams(sql, params, res -> {
                if (res.succeeded()) {
                    promise.complete();
                } else {
                    promise.fail(res.cause());
                }
            });
        }, resultHandler);
    }

    private Speaker mapRowToSpeaker(JsonArray row) {
        Speaker speaker = new Speaker();
        speaker.setSpeakerId(row.getInteger(0));  // speaker_id
        speaker.setName(row.getString(1));         // name
        speaker.setBio(row.getString(2));          // bio
        speaker.setExpertise(row.getString(3));    // expertise
        speaker.setEmail(row.getString(4));        // email
        speaker.setPhone(row.getString(5));        // phone
        speaker.setOrganization(row.getString(6)); // organization
        return speaker;
    }
}