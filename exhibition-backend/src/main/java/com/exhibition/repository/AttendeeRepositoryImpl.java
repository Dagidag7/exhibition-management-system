package com.exhibition.repository;

import com.exhibition.model.Attendee;
import com.exhibition.MainVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.ResultSet;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class AttendeeRepositoryImpl implements AttendeeRepository {

    private final SQLClient jdbc = MainVerticle.jdbc;

@Override
public void addAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler) {
    // Include payment_fee in INSERT if provided
    String sql;
    JsonArray params;
    
    if (attendee.getPaymentFee() != null) {
        sql = "INSERT INTO attendee (name, email, phone, password, registration_date, session_ids, payment_fee) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?)";
        params = new JsonArray()
                .add(attendee.getName())
                .add(attendee.getEmail())
                .add(attendee.getPhone())
                .add(attendee.getPassword())
                .add(attendee.getSessionIds())
                .add(attendee.getPaymentFee());
    } else {
        sql = "INSERT INTO attendee (name, email, phone, password, registration_date, session_ids) VALUES (?, ?, ?, ?, CURRENT_DATE, ?)";
        params = new JsonArray()
                .add(attendee.getName())
                .add(attendee.getEmail())
                .add(attendee.getPhone())
                .add(attendee.getPassword())
                .add(attendee.getSessionIds());
    }
    
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
    public void getAttendeeById(int id, Handler<AsyncResult<Attendee>> resultHandler) {
        String sql = "SELECT * FROM attendee WHERE attendee_id = ?";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.queryWithParams(sql, new JsonArray().add(id), ar -> {
                    connection.close();
                    if (ar.succeeded() && !ar.result().getRows().isEmpty()) {
                        for (JsonObject row : ar.result().getRows()) {
                        Attendee attendee = mapRowToAttendee(row);
                        resultHandler.handle(io.vertx.core.Future.succeededFuture(attendee));
                        }
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Not found"));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void getAllAttendees(Handler<AsyncResult<List<Attendee>>> resultHandler) {
        String sql = "SELECT * FROM attendee";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.query(sql, ar -> {
                    connection.close();
                    if (ar.succeeded()) {
                        List<Attendee> attendees = new ArrayList<>();
                        for (JsonObject row : ar.result().getRows()) {
                            Attendee attendee = mapRowToAttendee(row);
                            attendees.add(attendee);
                        }
                        resultHandler.handle(io.vertx.core.Future.succeededFuture(attendees));
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
    public void updateAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler) {
            String sql = "UPDATE attendee SET name=?, email=?, phone=?, password=?, registration_date=?, session_ids=?, profile_photo=? WHERE attendee_id=?";
        JsonArray params = new JsonArray()
                .add(attendee.getName())
                .add(attendee.getEmail())
                .add(attendee.getPhone())
                .add(attendee.getPassword())
                .add(attendee.getRegistrationDate())
                .add(attendee.getSessionIds())
                .add(attendee.getProfilePhoto())
                .add(attendee.getAttendeeId());

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
    public void deleteAttendee(int id, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "DELETE FROM attendee WHERE attendee_id = ?";
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

    @Override
    public void getAttendeeByEmail(String email, Handler<AsyncResult<Attendee>> resultHandler) {
        String sql = "SELECT * FROM attendee WHERE email = ?";
        jdbc.getConnection(res -> {
            if (res.succeeded()) {
                SQLConnection connection = res.result();
                connection.queryWithParams(sql, new JsonArray().add(email), ar -> {
                    connection.close();
                    if (ar.succeeded() && !ar.result().getRows().isEmpty()) {
                        JsonObject row = ar.result().getRows().get(0);
                        Attendee attendee = mapRowToAttendee(row);
                        resultHandler.handle(io.vertx.core.Future.succeededFuture(attendee));
                    } else {
                        resultHandler.handle(io.vertx.core.Future.failedFuture("Attendee not found"));
                    }
                });
            } else {
                resultHandler.handle(io.vertx.core.Future.failedFuture(res.cause()));
            }
        });
    }

    @Override
    public void updateAttendeePassword(int attendeeId, String password, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "UPDATE attendee SET password = ?, is_temporary_password = false WHERE attendee_id = ?";
        JsonArray params = new JsonArray().add(password).add(attendeeId);
        
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
    public void updateAttendeePasswordWithTemporaryFlag(int attendeeId, String password, boolean isTemporary, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "UPDATE attendee SET password = ?, is_temporary_password = ? WHERE attendee_id = ?";
        JsonArray params = new JsonArray().add(password).add(isTemporary).add(attendeeId);
        
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

    private Attendee mapRowToAttendee(JsonObject row) {
        Attendee attendee = new Attendee();
        attendee.setAttendeeId(row.getInteger("attendee_id"));
        attendee.setName(row.getString("name"));
        attendee.setEmail(row.getString("email"));
        attendee.setPhone(row.getString("phone"));
        attendee.setPassword(row.getString("password"));
        attendee.setSessionIds(row.getString("session_ids"));
        attendee.setRegistrationDate(row.getString("registration_date"));
        attendee.setStatus(row.getString("status"));
        attendee.setProfilePhoto(row.getString("profile_photo"));
        
        // Handle paymentFee - can be numeric or null
        Object paymentFeeObj = row.getValue("payment_fee");
        if (paymentFeeObj != null) {
            if (paymentFeeObj instanceof Number) {
                attendee.setPaymentFee(((Number) paymentFeeObj).doubleValue());
            } else if (paymentFeeObj instanceof String) {
                try {
                    attendee.setPaymentFee(Double.parseDouble((String) paymentFeeObj));
                } catch (NumberFormatException e) {
                    attendee.setPaymentFee(null);
                }
            }
        }
        
        // Handle is_temporary_password boolean
        Boolean isTemp = row.getBoolean("is_temporary_password");
        attendee.setTemporaryPassword(isTemp != null && isTemp);
        
        return attendee;
    }

    @Override
    public void updatePaymentFeeByEmail(String email, Double paymentFee, Handler<AsyncResult<Void>> resultHandler) {
        String sql = "UPDATE attendee SET payment_fee = ? WHERE email = ?";
        JsonArray params = new JsonArray().add(paymentFee).add(email);
        
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
}

