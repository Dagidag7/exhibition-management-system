package com.exhibition.controller;

import com.exhibition.model.Speaker;
import com.exhibition.service.ConferenceService;
import com.exhibition.service.SpeakerService;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class SpeakerController {

    public static void registerRoutes(Router router, SpeakerService speakerService, ConferenceService conferenceService) {
        router.post("/speakers").handler(ctx -> createSpeaker(ctx, speakerService));
        router.get("/speakers").handler(ctx -> getAllSpeakers(ctx, speakerService));
        router.get("/speakers/:id").handler(ctx -> getSpeakerById(ctx, speakerService));
        router.put("/speakers/:id").handler(ctx -> updateSpeaker(ctx, speakerService));
        router.delete("/speakers/:id").handler(ctx -> deleteSpeaker(ctx, speakerService, conferenceService));
    }

    private static void createSpeaker(RoutingContext ctx, SpeakerService speakerService) {
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        if (body == null || body.trim().isEmpty()) {
            ctx.response().setStatusCode(400).putHeader("content-type", "application/json").end("{\"error\": \"Request body is required\"}");
            return;
        }
        try {
            Speaker speaker = Json.decodeValue(body, Speaker.class);
            speakerService.registerSpeaker(speaker, res -> {
                if (res.succeeded()) {
                    ctx.response().setStatusCode(201).putHeader("content-type", "application/json").end("{\"message\": \"Speaker created successfully\", \"id\": " + res.result() + "}");
                } else {
                    ctx.response().setStatusCode(500).putHeader("content-type", "application/json").end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            ctx.response().setStatusCode(400).putHeader("content-type", "application/json").end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void getAllSpeakers(RoutingContext ctx, SpeakerService speakerService) {
        speakerService.listSpeakers(res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json").end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(500).putHeader("content-type", "application/json").end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void getSpeakerById(RoutingContext ctx, SpeakerService speakerService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        speakerService.getSpeaker(id, res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json").end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(404).putHeader("content-type", "application/json").end("{\"error\": \"Speaker not found\"}");
            }
        });
    }

    private static void updateSpeaker(RoutingContext ctx, SpeakerService speakerService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        if (body == null || body.trim().isEmpty()) {
            ctx.response().setStatusCode(400).putHeader("content-type", "application/json").end("{\"error\": \"Request body is required\"}");
            return;
        }
        try {
            Speaker speaker = Json.decodeValue(body, Speaker.class);
            speaker.setSpeakerId(id);
            speakerService.updateSpeaker(speaker, res -> {
                if (res.succeeded()) {
                    ctx.response().putHeader("content-type", "application/json").end("{\"message\": \"Speaker updated successfully\"}");
                } else {
                    ctx.response().setStatusCode(500).putHeader("content-type", "application/json").end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            ctx.response().setStatusCode(400).putHeader("content-type", "application/json").end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void deleteSpeaker(RoutingContext ctx, SpeakerService speakerService, ConferenceService conferenceService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        speakerService.getSpeaker(id, getRes -> {
            if (getRes.failed()) {
                ctx.response().setStatusCode(500).putHeader("content-type", "application/json").end("{\"error\": \"" + getRes.cause().getMessage() + "\"}");
                return;
            }
            Speaker speaker = getRes.result();
            String speakerName = speaker != null ? (speaker.getName() != null ? speaker.getName().trim() : null) : null;
            speakerService.removeSpeaker(id, res -> {
                if (res.succeeded()) {
                    if (speakerName != null && !speakerName.isEmpty()) {
                        conferenceService.clearSpeakerFromConferences(speakerName, clearRes -> {
                            ctx.response().putHeader("content-type", "application/json").end("{\"message\": \"Speaker deleted successfully\"}");
                        });
                    } else {
                        ctx.response().putHeader("content-type", "application/json").end("{\"message\": \"Speaker deleted successfully\"}");
                    }
                } else {
                    ctx.response().setStatusCode(500).putHeader("content-type", "application/json").end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        });
    }
}