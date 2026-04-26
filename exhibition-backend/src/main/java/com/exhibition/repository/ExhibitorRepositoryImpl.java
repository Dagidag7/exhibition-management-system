package com.exhibition.repository;

import com.exhibition.MainVerticle;
import com.exhibition.model.Exhibitor;

import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ExhibitorRepositoryImpl implements ExhibitorRepository {

    private final SQLClient jdbc;
    
    public ExhibitorRepositoryImpl() {
        this.jdbc = MainVerticle.jdbc;
    }

    @Override
    public void addExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Integer>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "INSERT INTO exhibitor (company_name, contact_person, email, booth_number, product_ids, logo_url, floor_number, password, password_changed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING exhibitor_id";
                
                JsonArray params = new JsonArray()
                    .add(exhibitor.getCompanyName())
                    .add(exhibitor.getContactPerson())
                    .add(exhibitor.getEmail())
                    .add(exhibitor.getBoothNumber())
                    .add(exhibitor.getProductIds())
                    .add(exhibitor.getLogoUrl())
                    .add(exhibitor.getFloorNumber())
                    .add(exhibitor.getPassword())
                    .add(false);

                jdbc.queryWithParams(sql, params, res -> {
                if (res.succeeded()) {
                        ResultSet rs = res.result();
                        if (rs.getNumRows() > 0) {
                            Integer id = rs.getResults().get(0).getInteger(0);
                            promise.complete(id);
                        } else {
                            promise.fail("Failed to insert exhibitor");
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
    public void getExhibitorById(int id, Handler<AsyncResult<Exhibitor>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "SELECT exhibitor_id, company_name, contact_person, email, booth_number, product_ids, logo_url, floor_number, password_changed FROM exhibitor WHERE exhibitor_id = ?";

                jdbc.queryWithParams(sql, new JsonArray().add(id), res -> {
                if (res.succeeded()) {
                        ResultSet rs = res.result();
                        if (rs.getNumRows() > 0) {
                            JsonObject row = rs.getRows().get(0);
                            Exhibitor exhibitor = mapRowToExhibitor(row);
                            promise.complete(exhibitor);
                        } else {
                            promise.fail("Exhibitor not found");
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
    public void getAllExhibitors(Handler<AsyncResult<List<Exhibitor>>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "SELECT exhibitor_id, company_name, contact_person, email, booth_number, product_ids, logo_url, floor_number, password_changed, status FROM exhibitor ORDER BY company_name";

                jdbc.query(sql, res -> {
                if (res.succeeded()) {
                        ResultSet rs = res.result();
                            List<Exhibitor> exhibitors = new ArrayList<>();
                        
                        for (JsonObject row : rs.getRows()) {
                            exhibitors.add(mapRowToExhibitor(row));
                        }
                        
                            promise.complete(exhibitors);
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
    public void updateExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "UPDATE exhibitor SET company_name=?, contact_person=?, email=?, booth_number=?, product_ids=?, status=?, logo_url=?, floor_number=? WHERE exhibitor_id = ?";
                JsonArray params = new JsonArray()
                        .add(exhibitor.getCompanyName())
                        .add(exhibitor.getContactPerson())
                        .add(exhibitor.getEmail())
                        .add(exhibitor.getBoothNumber())
                        .add(exhibitor.getProductIds())
                        .add(exhibitor.getStatus()) 
                        .add(exhibitor.getLogoUrl())
                        .add(exhibitor.getFloorNumber())  
                        .add(exhibitor.getExhibitorId());

                jdbc.updateWithParams(sql, params, res -> {
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
    public void deleteExhibitor(int id, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                jdbc.getConnection(connRes -> {
                    if (connRes.failed()) {
                        promise.fail(connRes.cause());
                        return;
                    }

                    SQLConnection connection = connRes.result();

                    // First delete all products belonging to this exhibitor to avoid FK constraint issues
                    String deleteProductsSql = "DELETE FROM product WHERE exhibitor_id = ?";
                    connection.updateWithParams(deleteProductsSql, new JsonArray().add(id), prodRes -> {
                        if (prodRes.failed()) {
                            connection.close();
                            promise.fail(prodRes.cause());
                            return;
                        }

                        // Then delete the exhibitor itself
                        String deleteExhibitorSql = "DELETE FROM exhibitor WHERE exhibitor_id = ?";
                        connection.updateWithParams(deleteExhibitorSql, new JsonArray().add(id), exhibRes -> {
                            connection.close();
                            if (exhibRes.succeeded()) {
                                promise.complete();
                            } else {
                                promise.fail(exhibRes.cause());
                            }
                        });
                    });
                });
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }
    
    public void updateExhibitorPassword(int exhibitorId, String password, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "UPDATE exhibitor SET password = ?, password_changed = true, is_temporary_password = false WHERE exhibitor_id = ?";
                
                JsonArray params = new JsonArray()
                    .add(password)
                    .add(exhibitorId);
                
                jdbc.updateWithParams(sql, params, res -> {
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
    public void updateExhibitorPasswordWithTemporaryFlag(int exhibitorId, String password, boolean isTemporary, Handler<AsyncResult<Void>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "UPDATE exhibitor SET password = ?, password_changed = ?, is_temporary_password = ? WHERE exhibitor_id = ?";
                
                JsonArray params = new JsonArray()
                    .add(password)
                    .add(!isTemporary) // password_changed is false for temporary passwords
                    .add(isTemporary)
                    .add(exhibitorId);
                
                jdbc.updateWithParams(sql, params, res -> {
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
    
        public void getExhibitorByEmail(String email, Handler<AsyncResult<Exhibitor>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String sql = "SELECT exhibitor_id, company_name, contact_person, email, booth_number, product_ids, password, logo_url, floor_number, password_changed, status FROM exhibitor WHERE email = ?";

                jdbc.queryWithParams(sql, new JsonArray().add(email), res -> {
                if (res.succeeded()) {
                        ResultSet rs = res.result();
                        if (rs.getNumRows() > 0) {
                            JsonObject row = rs.getRows().get(0);
                            Exhibitor exhibitor = mapRowToExhibitorWithPassword(row);
                            promise.complete(exhibitor);
                        } else {
                            promise.fail("Exhibitor not found");
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
    
    private Exhibitor mapRowToExhibitor(JsonObject row) {
        Exhibitor exhibitor = new Exhibitor();
        exhibitor.setExhibitorId(row.getInteger("exhibitor_id"));
        exhibitor.setCompanyName(row.getString("company_name"));
        exhibitor.setContactPerson(row.getString("contact_person"));
        exhibitor.setEmail(row.getString("email"));
        exhibitor.setBoothNumber(row.getString("booth_number"));
        exhibitor.setProductIds(row.getString("product_ids"));
        exhibitor.setLogoUrl(row.getString("logo_url"));
        exhibitor.setFloorNumber(row.getString("floor_number"));
        exhibitor.setPasswordChanged(row.getBoolean("password_changed", false));
        try {
            exhibitor.setStatus(row.getString("status"));
        } catch (Exception e) {
            exhibitor.setStatus("active");
        }
        
        exhibitor.setRegistrationDate(LocalDateTime.now());
        
        return exhibitor;
    }
    
    private Exhibitor mapRowToExhibitorWithPassword(JsonObject row) {
        Exhibitor exhibitor = new Exhibitor();
        exhibitor.setExhibitorId(row.getInteger("exhibitor_id"));
        exhibitor.setCompanyName(row.getString("company_name"));
        exhibitor.setContactPerson(row.getString("contact_person"));
        exhibitor.setEmail(row.getString("email"));
        exhibitor.setBoothNumber(row.getString("booth_number"));
        exhibitor.setProductIds(row.getString("product_ids"));
        exhibitor.setPassword(row.getString("password"));
        exhibitor.setLogoUrl(row.getString("logo_url"));
        exhibitor.setFloorNumber(row.getString("floor_number"));
        exhibitor.setPasswordChanged(row.getBoolean("password_changed", false));
        // For now, use password_changed as indicator of temporary password
        exhibitor.setTemporaryPassword(!row.getBoolean("password_changed", true));
        try {
            exhibitor.setStatus(row.getString("status"));
        } catch (Exception e) {
            exhibitor.setStatus("active"); 
        }
        
        exhibitor.setRegistrationDate(LocalDateTime.now());
        
        return exhibitor;
    }
    @Override
public void isBoothTaken(String floorNumber, String boothNumber, Integer excludeExhibitorId, Handler<AsyncResult<Boolean>> resultHandler) {
    // First check if booth number is unique across all floors
    String uniqueBoothSql = excludeExhibitorId == null
        ? "SELECT 1 FROM exhibitor WHERE booth_number = ? LIMIT 1"
        : "SELECT 1 FROM exhibitor WHERE booth_number = ? AND exhibitor_id <> ? LIMIT 1";

    JsonArray uniqueBoothParams = excludeExhibitorId == null
        ? new JsonArray().add(boothNumber == null ? null : boothNumber.trim())
        : new JsonArray().add(boothNumber == null ? null : boothNumber.trim())
                         .add(excludeExhibitorId);

    MainVerticle.jdbc.queryWithParams(uniqueBoothSql, uniqueBoothParams, res -> {
        if (res.failed()) {
            resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            return;
        }
        
        boolean boothExists = res.result().getNumRows() > 0;
        if (boothExists) {
            resultHandler.handle(io.vertx.core.Future.succeededFuture(true));
            return;
        }
        
        // If booth doesn't exist, check floor-specific validation
        String floorSql = excludeExhibitorId == null
            ? "SELECT 1 FROM exhibitor WHERE floor_number = ? AND booth_number = ? LIMIT 1"
            : "SELECT 1 FROM exhibitor WHERE floor_number = ? AND booth_number = ? AND exhibitor_id <> ? LIMIT 1";

        JsonArray floorParams = excludeExhibitorId == null
            ? new JsonArray().add(floorNumber == null ? null : floorNumber.trim())
                             .add(boothNumber == null ? null : boothNumber.trim())
            : new JsonArray().add(floorNumber == null ? null : floorNumber.trim())
                             .add(boothNumber == null ? null : boothNumber.trim())
                             .add(excludeExhibitorId);

        MainVerticle.jdbc.queryWithParams(floorSql, floorParams, floorRes -> {
            if (floorRes.succeeded()) {
                boolean taken = floorRes.result().getNumRows() > 0;
                resultHandler.handle(io.vertx.core.Future.succeededFuture(taken));
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(floorRes.cause()));
            }
        });
    });
}

public void getFloorExhibitorCount(String floorNumber, Handler<AsyncResult<Integer>> resultHandler) {
    String sql = "SELECT COUNT(*) FROM exhibitor WHERE floor_number = ?";
    JsonArray params = new JsonArray().add(floorNumber == null ? null : floorNumber.trim());

    MainVerticle.jdbc.queryWithParams(sql, params, res -> {
        if (res.succeeded()) {
            int count = res.result().getResults().get(0).getInteger(0);
            resultHandler.handle(io.vertx.core.Future.succeededFuture(count));
        } else {
            resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
        }
    });
}
}