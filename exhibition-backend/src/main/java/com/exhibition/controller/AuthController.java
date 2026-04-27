package com.exhibition.controller;

import com.exhibition.service.AuthService;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;

public class AuthController {
    
    public static void registerRoutes(Router router, AuthService authService) {
        router.route("/auth/*").handler(BodyHandler.create());
        
        router.post("/auth/login").handler(ctx -> login(ctx, authService));
        router.post("/auth/test-login").handler(ctx -> testLogin(ctx, authService));
        router.get("/auth/me").handler(ctx -> getCurrentUser(ctx, authService));
        router.post("/auth/logout").handler(ctx -> logout(ctx, authService));
        router.post("/auth/change-password").handler(ctx -> changePassword(ctx, authService));
        router.get("/auth/users/:id/status").handler(ctx -> getUserStatus(ctx, authService));
        router.get("/auth/users/:id").handler(ctx -> getUserById(ctx, authService));
    }
    
    private static void login(RoutingContext ctx, AuthService authService) {
        try {
            JsonObject body = ctx.getBodyAsJson();
            String email = body.getString("email");
            String password = body.getString("password");
            
            if (email == null || password == null) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("error", "Email and password are required")
                        .encode());
                return;
            }
            
            authService.authenticateUser(email, password, result -> {
                if (result.succeeded()) {
                    JsonObject userData = result.result();
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject()
                            .put("user", userData)
                            .put("token", "dummy-token-" + System.currentTimeMillis()) // In real app, use JWT
                            .put("role", userData.getString("role"))
                            .encode());
                } else {
                    ctx.response()
                        .setStatusCode(401)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject()
                            .put("error", "Invalid credentials")
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error")
                    .encode());
        }
    }
    
    private static void testLogin(RoutingContext ctx, AuthService authService) {
        try {
            JsonObject body = ctx.getBodyAsJson();
            String email = body.getString("email");
            String password = body.getString("password");
            
            if (email == null || password == null) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("error", "Email and password are required")
                        .encode());
                return;
            }
            
            // This will trigger our detailed logging and return the result
            authService.authenticateUser(email, password, result -> {
                JsonObject response = new JsonObject();
                if (result.succeeded()) {
                    JsonObject userData = result.result();
                    response.put("success", true)
                           .put("message", "Authentication successful")
                           .put("user", userData);
                } else {
                    response.put("success", false)
                           .put("message", "Authentication failed: " + result.cause().getMessage())
                           .put("error", result.cause().getMessage());
                }
                
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(response.encode());
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error: " + e.getMessage())
                    .encode());
        }
    }
    
    private static void getCurrentUser(RoutingContext ctx, AuthService authService) {
        // In a real application, you would verify the JWT token here
        String authHeader = ctx.request().getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Unauthorized")
                    .encode());
            return;
        }

        // Use configured admin email when available (ADMIN_EMAIL env var)
        String adminEmail = System.getenv("ADMIN_EMAIL");
        if (adminEmail == null || adminEmail.trim().isEmpty()) {
            adminEmail = "admin@example.com";
        }

        JsonObject mockUser = new JsonObject()
            .put("id", 1)
            .put("email", adminEmail)
            .put("name", "Admin User")
            .put("role", "admin");
            
        ctx.response()
            .setStatusCode(200)
            .putHeader("Content-Type", "application/json")
            .end(mockUser.encode());
    }
    
    private static void logout(RoutingContext ctx, AuthService authService) {
        ctx.response()
            .setStatusCode(200)
            .putHeader("Content-Type", "application/json")
            .end(new JsonObject()
                .put("message", "Logged out successfully")
                .encode());
    }
    
    private static void changePassword(RoutingContext ctx, AuthService authService) {
        try {
            JsonObject body = ctx.getBodyAsJson();
            String currentPassword = body.getString("currentPassword");
            String newPassword = body.getString("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("error", "Current password and new password are required")
                        .encode());
                return;
            }
            
            // For now, just return success (in real app, verify current password and update)
            ctx.response()
                .setStatusCode(200)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("message", "Password changed successfully")
                    .encode());
                    
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error")
                    .encode());
        }
    }
    
    private static void getUserStatus(RoutingContext ctx, AuthService authService) {
        try {
            String userId = ctx.pathParam("id");
            
            if (userId == null) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("error", "User ID is required")
                        .encode());
                return;
            }
            
            // Get user status from database
            authService.getUserStatus(Integer.parseInt(userId), result -> {
                if (result.succeeded()) {
                    JsonObject statusData = result.result();
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("Content-Type", "application/json")
                        .end(statusData.encode());
                } else {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject()
                            .put("error", "User not found")
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error")
                    .encode());
        }
    }
    
    private static void getUserById(RoutingContext ctx, AuthService authService) {
        try {
            String userId = ctx.pathParam("id");
            
            if (userId == null) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                        .put("error", "User ID is required")
                        .encode());
                return;
            }
            
            // Get user data from database
            authService.getUserById(Integer.parseInt(userId), result -> {
                if (result.succeeded()) {
                    JsonObject userData = result.result();
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("Content-Type", "application/json")
                        .end(userData.encode());
                } else {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("Content-Type", "application/json")
                        .end(new JsonObject()
                            .put("error", "User not found")
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("Content-Type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error")
                    .encode());
        }
    }
} 