package com.exhibition.controller;

import com.exhibition.model.Conference;
import com.exhibition.service.ConferenceService;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class ConferenceController {

    public static void registerRoutes(Router router, ConferenceService conferenceService) {
        router.post("/conferences").handler(ctx -> createConference(ctx, conferenceService));
        router.get("/conferences").handler(ctx -> getAllConferences(ctx, conferenceService));
        router.get("/conferences/:id").handler(ctx -> getConferenceById(ctx, conferenceService));
        router.put("/conferences/:id").handler(ctx -> updateConference(ctx, conferenceService));
        router.delete("/conferences/:id").handler(ctx -> deleteConference(ctx, conferenceService));
        router.post("/conferences/clear-speaker").handler(ctx -> clearSpeakerFromConferences(ctx, conferenceService));
    }

    private static void createConference(RoutingContext ctx, ConferenceService conferenceService) {
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Conference conference = Json.decodeValue(body, Conference.class);
            conferenceService.registerConference(conference, res -> {
                if (res.succeeded()) {
                    ctx.response()
                        .setStatusCode(201)
                        .putHeader("content-type", "application/json")
                        .end("{\"message\": \"Conference created successfully\", \"id\": " + res.result() + "}");
                } else {
                    ctx.response()
                        .setStatusCode(500)
                        .putHeader("content-type", "application/json")
                        .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void getAllConferences(RoutingContext ctx, ConferenceService conferenceService) {
        conferenceService.listConferences(res -> {
            if (res.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void getConferenceById(RoutingContext ctx, ConferenceService conferenceService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        conferenceService.getConference(id, res -> {
            if (res.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response()
                    .setStatusCode(404)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"Conference not found\"}");
            }
        });
    }

    private static void updateConference(RoutingContext ctx, ConferenceService conferenceService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Conference conference = Json.decodeValue(body, Conference.class);
            conference.setConferenceId(id);
            conferenceService.updateConference(conference, res -> {
                if (res.succeeded()) {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .end("{\"message\": \"Conference updated successfully\"}");
                } else {
                    ctx.response()
                        .setStatusCode(500)
                        .putHeader("content-type", "application/json")
                        .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void deleteConference(RoutingContext ctx, ConferenceService conferenceService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        conferenceService.removeConference(id, res -> {
            if (res.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .end("{\"message\": \"Conference deleted successfully\"}");
            } else {
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void clearSpeakerFromConferences(RoutingContext ctx, ConferenceService conferenceService) {
        io.vertx.core.json.JsonObject body = ctx.getBodyAsJson();
        if (body == null || !body.containsKey("speakerName")) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"speakerName is required\"}");
            return;
        }
        String speakerName = body.getString("speakerName");
        if (speakerName == null || speakerName.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"speakerName cannot be empty\"}");
            return;
        }
        conferenceService.clearSpeakerFromConferences(speakerName.trim(), res -> {
            if (res.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .end("{\"message\": \"Speaker cleared from conferences successfully\"}");
            } else {
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }
}