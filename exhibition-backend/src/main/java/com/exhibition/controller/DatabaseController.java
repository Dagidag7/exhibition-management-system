package com.exhibition.controller;

import com.exhibition.service.DatabaseService;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;

public class DatabaseController {
    
    public static void registerRoutes(Router router, DatabaseService databaseService) {
        router.route("/database/*").handler(BodyHandler.create());
        
        router.get("/database/health").handler(ctx -> getDatabaseHealth(ctx, databaseService));
        
        router.get("/database/tables").handler(ctx -> getAllTables(ctx, databaseService));
        
        router.get("/database/schema/:tableName").handler(ctx -> getTableSchema(ctx, databaseService));
        

        
        router.post("/database/update-conference-schema").handler(ctx -> updateConferenceSchema(ctx, databaseService));
        
        router.post("/database/add-sample-conferences").handler(ctx -> addSampleConferences(ctx, databaseService));
        
        router.get("/database/stats").handler(ctx -> getDatabaseStats(ctx, databaseService));
    }
    
    private static void getDatabaseHealth(RoutingContext ctx, DatabaseService databaseService) {
        databaseService.getDatabaseHealth()
                .onSuccess(health -> {
                    ctx.response()
                            .putHeader("Content-Type", "application/json")
                            .end(health.encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to get database health: " + err.getMessage())
                                    .encode());
                });
    }
    
    private static void getAllTables(RoutingContext ctx, DatabaseService databaseService) {
        databaseService.getAllTables()
                .onSuccess(tables -> {
                    ctx.response()
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("tables", tables)
                                    .encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to get tables: " + err.getMessage())
                                    .encode());
                });
    }
    
    private static void getTableSchema(RoutingContext ctx, DatabaseService databaseService) {
        String tableName = ctx.pathParam("tableName");
        if (tableName == null || tableName.trim().isEmpty()) {
            ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                            .put("error", true)
                            .put("message", "Table name is required")
                            .encode());
            return;
        }
        
        databaseService.getTableSchema(tableName)
                .onSuccess(schema -> {
                    ctx.response()
                            .putHeader("Content-Type", "application/json")
                            .end(schema.encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to get schema: " + err.getMessage())
                                    .encode());
                });
    }
    
    private static void updateConferenceSchema(RoutingContext ctx, DatabaseService databaseService) {
        JsonObject body = ctx.getBodyAsJson();
        if (body == null) {
            ctx.response()
                    .setStatusCode(400)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject()
                            .put("error", true)
                            .put("message", "Request body is required")
                            .encode());
            return;
        }
        
        databaseService.updateConferenceSchema(body)
                .onSuccess(result -> {
                    int statusCode = result.getBoolean("success", false) ? 200 : 400;
                    ctx.response()
                            .setStatusCode(statusCode)
                            .putHeader("Content-Type", "application/json")
                            .end(result.encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to update schema: " + err.getMessage())
                                    .encode());
                });
    }
    
    private static void addSampleConferences(RoutingContext ctx, DatabaseService databaseService) {
        databaseService.addSampleConferences()
                .onSuccess(result -> {
                    int statusCode = result.getBoolean("success", false) ? 200 : 400;
                    ctx.response()
                            .setStatusCode(statusCode)
                            .putHeader("Content-Type", "application/json")
                            .end(result.encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to add sample data: " + err.getMessage())
                                    .encode());
                });
    }
    
    private static void getDatabaseStats(RoutingContext ctx, DatabaseService databaseService) {
        databaseService.getDatabaseStats()
                .onSuccess(stats -> {
                    ctx.response()
                            .putHeader("Content-Type", "application/json")
                            .end(stats.encode());
                })
                .onFailure(err -> {
                    ctx.response()
                            .setStatusCode(500)
                            .putHeader("Content-Type", "application/json")
                            .end(new JsonObject()
                                    .put("error", true)
                                    .put("message", "Failed to get database stats: " + err.getMessage())
                                    .encode());
                });
    }
    

} 