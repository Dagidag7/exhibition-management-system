package com.exhibition.repository;

import com.exhibition.model.Partner;
import com.exhibition.MainVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class PartnerRepositoryImpl implements PartnerRepository {

    private final SQLClient jdbc = MainVerticle.jdbc;

    @Override
    public void addPartner(Partner partner, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "INSERT INTO partner (name, contact_person, email, partnership_type, benefits) VALUES (?, ?, ?, ?, ?)";
        JsonArray params = new JsonArray()
                .add(partner.getName())
                .add(partner.getContactPerson())
                .add(partner.getEmail())
                .add(partner.getPartnershipType())
                .add(partner.getBenefits());

        System.out.println("Adding partner: " + partner.getName() + ", email: " + partner.getEmail());
        
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.updateWithParams(sql, params, ar -> {
                    connection.close();
                    if (ar.succeeded()) {
                        System.out.println("Partner added successfully: " + partner.getName());
                        resultHandler.handle(io.vertx.core.Future.succeededFuture());
                    } else {
                        System.err.println("Failed to add partner: " + ar.cause().getMessage());
                        resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
                    }
                });
            } else {
                System.err.println("Database connection failed: " + res.cause().getMessage());
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void getPartnerById(int id, Handler<AsyncResult<Partner>> resultHandler) {
        String sql = "SELECT * FROM partner WHERE partner_id = ?";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.queryWithParams(sql, new JsonArray().add(id), ar -> {
                    connection.close();
                    if (ar.succeeded() && !ar.result().getRows().isEmpty()) {
                        JsonObject row = ar.result().getRows().get(0);
                        Partner partner = new Partner();
                        partner.setPartnerId(row.getInteger("partner_id"));
                        partner.setName(row.getString("name"));
                        partner.setContactPerson(row.getString("contact_person"));
                        partner.setEmail(row.getString("email"));
                        partner.setPartnershipType(row.getString("partnership_type"));
                        partner.setBenefits(row.getString("benefits"));
                        resultHandler.handle(io.vertx.core.Future.succeededFuture(partner));
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Partner not found"));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void getAllPartners(Handler<AsyncResult<List<Partner>>> resultHandler) {
        String sql = "SELECT * FROM partner ORDER BY name";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.query(sql, ar -> {
                    connection.close();
                    if (ar.succeeded()) {
                        List<Partner> partners = new ArrayList<>();
                        for (JsonObject row : ar.result().getRows()) {
                            Partner partner = new Partner();
                            partner.setPartnerId(row.getInteger("partner_id"));
                            partner.setName(row.getString("name"));
                            partner.setContactPerson(row.getString("contact_person"));
                            partner.setEmail(row.getString("email"));
                            partner.setPartnershipType(row.getString("partnership_type"));
                            partner.setBenefits(row.getString("benefits"));
                            partners.add(partner);
                        }
                        resultHandler.handle(io.vertx.core.Future.succeededFuture(partners));
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void updatePartner(Partner partner, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "UPDATE partner SET name=?, contact_person=?, email=?, partnership_type=?, benefits=? WHERE partner_id=?";
        JsonArray params = new JsonArray()
                .add(partner.getName())
                .add(partner.getContactPerson())
                .add(partner.getEmail())
                .add(partner.getPartnershipType())
                .add(partner.getBenefits())
                .add(partner.getPartnerId());

        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.updateWithParams(sql, params, ar -> {
                    connection.close();
                    if (ar.succeeded()) {
                        resultHandler.handle(io.vertx.core.Future.succeededFuture());
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void deletePartner(int id, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "DELETE FROM partner WHERE partner_id = ?";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.updateWithParams(sql, new JsonArray().add(id), ar -> {
                    connection.close();
                    if (ar.succeeded()) {
                        resultHandler.handle(io.vertx.core.Future.succeededFuture());
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture(ar.cause()));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }
}