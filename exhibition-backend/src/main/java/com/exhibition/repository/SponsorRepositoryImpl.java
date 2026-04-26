package com.exhibition.repository;

import com.exhibition.model.Sponsor;
import com.exhibition.MainVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class SponsorRepositoryImpl implements SponsorRepository {

    private final SQLClient jdbc = MainVerticle.jdbc;

    @Override
    public void addSponsor(Sponsor sponsor, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "INSERT INTO sponsor (name, contact_person, email, contribution_amount, benefits, logo_url) VALUES (?, ?, ?, ?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(sponsor.getName())
                .add(sponsor.getContactPerson())
                .add(sponsor.getEmail() != null ? sponsor.getEmail() : "")
                .add(sponsor.getContributionAmount())
                .add(sponsor.getBenefits())
                .add(sponsor.getLogoUrl());

        MainVerticle.vertx.executeBlocking(promise -> {
            jdbc.getConnection(res -> {
                if (res.succeeded()) {
                    SQLConnection connection = res.result();
                    connection.updateWithParams(sql, params, ar -> {
                        connection.close();
                        if (ar.succeeded()) {
                            promise.complete();
                        } else {
                            promise.fail(ar.cause());
                        }
                    });
                } else {
                    promise.fail(res.cause());
                }
            });
        }, false, ar -> {
            if (ar.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }

    @Override
    public void getSponsorById(int id, Handler<AsyncResult<Sponsor>> resultHandler) {
        String sql = "SELECT * FROM sponsor WHERE sponsor_id = ?";
        MainVerticle.vertx.executeBlocking(promise -> {
            jdbc.getConnection(res -> {
                if (res.succeeded()) {
                    SQLConnection connection = res.result();
                    connection.queryWithParams(sql, new JsonArray().add(id), ar -> {
                        connection.close();
                        if (ar.succeeded() && !ar.result().getRows().isEmpty()) {
                            JsonObject row = ar.result().getRows().get(0);
                            Sponsor sponsor = new Sponsor();
                            sponsor.setSponsorId(row.getInteger("sponsor_id"));
                            sponsor.setName(row.getString("name"));
                            sponsor.setContactPerson(row.getString("contact_person"));
                            sponsor.setEmail(row.getString("email"));
                            sponsor.setContributionAmount(row.getDouble("contribution_amount"));
                            sponsor.setBenefits(row.getString("benefits"));
                            sponsor.setLogoUrl(row.getString("logo_url"));
                            promise.complete(sponsor);
                        } else {
                            promise.fail("Sponsor not found");
                        }
                    });
                } else {
                    promise.fail(res.cause());
                }
            });
        }, false, ar -> {
            if (ar.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture((Sponsor) ar.result()));
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }

    @Override
    public void getAllSponsors(Handler<AsyncResult<List<Sponsor>>> resultHandler) {
        String sql = "SELECT * FROM sponsor ORDER BY contribution_amount DESC";
        MainVerticle.vertx.executeBlocking(promise -> {
            jdbc.getConnection(res -> {
                if (res.succeeded()) {
                    SQLConnection connection = res.result();
                    connection.query(sql, ar -> {
                        connection.close();
                        if (ar.succeeded()) {
                            List<Sponsor> sponsors = new ArrayList<>();
                            for (JsonObject row : ar.result().getRows()) {
                                Sponsor sponsor = new Sponsor();
                                sponsor.setSponsorId(row.getInteger("sponsor_id"));
                                sponsor.setName(row.getString("name"));
                                sponsor.setContactPerson(row.getString("contact_person"));
                                sponsor.setEmail(row.getString("email"));
                                sponsor.setContributionAmount(row.getDouble("contribution_amount"));
                                sponsor.setBenefits(row.getString("benefits"));
                                sponsor.setLogoUrl(row.getString("logo_url"));
                                sponsors.add(sponsor);
                            }
                            promise.complete(sponsors);
                        } else {
                            promise.fail(ar.cause());
                        }
                    });
                } else {
                    promise.fail(res.cause());
                }
            });
        }, false, ar -> {
            if (ar.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture((List<Sponsor>) ar.result()));
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }

    @Override
    public void updateSponsor(Sponsor sponsor, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "UPDATE sponsor SET name=?, contact_person=?, email=?, contribution_amount=?, benefits=?, logo_url=? WHERE sponsor_id=?";
        JsonArray params = new JsonArray()
                .add(sponsor.getName())
                .add(sponsor.getContactPerson())
                .add(sponsor.getEmail() != null ? sponsor.getEmail() : "")
                .add(sponsor.getContributionAmount())
                .add(sponsor.getBenefits())
                .add(sponsor.getLogoUrl())
                .add(sponsor.getSponsorId());

        MainVerticle.vertx.executeBlocking(promise -> {
            jdbc.getConnection(res -> {
                if (res.succeeded()) {
                    SQLConnection connection = res.result();
                    connection.updateWithParams(sql, params, ar -> {
                        connection.close();
                        if (ar.succeeded()) {
                            promise.complete();
                        } else {
                            promise.fail(ar.cause());
                        }
                    });
                } else {
                    promise.fail(res.cause());
                }
            });
        }, false, ar -> {
            if (ar.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }

    @Override
    public void deleteSponsor(int id, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "DELETE FROM sponsor WHERE sponsor_id = ?";
        MainVerticle.vertx.executeBlocking(promise -> {
            jdbc.getConnection(res -> {
                if (res.succeeded()) {
                    SQLConnection connection = res.result();
                    connection.updateWithParams(sql, new JsonArray().add(id), ar -> {
                        connection.close();
                        if (ar.succeeded()) {
                            promise.complete();
                        } else {
                            promise.fail(ar.cause());
                        }
                    });
                } else {
                    promise.fail(res.cause());
                }
            });
        }, false, ar -> {
            if (ar.succeeded()) {
                resultHandler.handle(io.vertx.core.Future.succeededFuture());
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
            }
        });
    }
}