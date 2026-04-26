package com.exhibition.service;

import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
 
public interface AuthService {
    void authenticateUser(String email, String password, Handler<io.vertx.core.AsyncResult<JsonObject>> resultHandler);
    void getUserById(int userId, Handler<io.vertx.core.AsyncResult<JsonObject>> resultHandler);
    void updateUserRole(int userId, String role, Handler<io.vertx.core.AsyncResult<Void>> resultHandler);
    void getUserStatus(int userId, Handler<io.vertx.core.AsyncResult<JsonObject>> resultHandler);
} 