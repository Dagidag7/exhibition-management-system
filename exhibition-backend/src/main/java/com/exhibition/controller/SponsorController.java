package com.exhibition.controller;

import com.exhibition.model.Sponsor;
import com.exhibition.service.SponsorService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class SponsorController {

    public static void registerRoutes(Router router, SponsorService sponsorService) {
        router.post("/sponsors").handler(ctx -> createSponsor(ctx, sponsorService));
        router.get("/sponsors").handler(ctx -> getAllSponsors(ctx, sponsorService));
        router.get("/sponsors/:id").handler(ctx -> getSponsorById(ctx, sponsorService));
        router.put("/sponsors/:id").handler(ctx -> updateSponsor(ctx, sponsorService));
        router.delete("/sponsors/:id").handler(ctx -> deleteSponsor(ctx, sponsorService));
        router.post("/sponsors/api/payment").handler(ctx -> handlePayment(ctx));
    }

    private static void createSponsor(RoutingContext ctx, SponsorService sponsorService) {
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Sponsor sponsor = Json.decodeValue(body, Sponsor.class);
            sponsorService.registerSponsor(sponsor, res -> {
                if (res.succeeded()) {
                    ctx.response()
                       .setStatusCode(201)
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"Sponsor created successfully\"}");
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

    private static void getAllSponsors(RoutingContext ctx, SponsorService sponsorService) {
        sponsorService.listSponsors(res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(500).end(res.cause().getMessage());
            }
        });
    }

    private static void getSponsorById(RoutingContext ctx, SponsorService sponsorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        sponsorService.getSponsor(id, res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(404).end("Sponsor not found");
            }
        });
    }

    private static void updateSponsor(RoutingContext ctx, SponsorService sponsorService) {
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
            Sponsor sponsor = Json.decodeValue(body, Sponsor.class);
            sponsor.setSponsorId(id);
            sponsorService.updateSponsor(sponsor, res -> {
                if (res.succeeded()) {
                    ctx.response()
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"Sponsor updated successfully\"}");
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

    private static void deleteSponsor(RoutingContext ctx, SponsorService sponsorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        sponsorService.removeSponsor(id, res -> {
            if (res.succeeded()) {
                ctx.response()
                   .putHeader("content-type", "application/json")
                   .end("{\"message\": \"Sponsor deleted successfully\"}");
            } else {
                ctx.response()
                   .setStatusCode(500)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void handlePayment(RoutingContext ctx) {
        // Load Stripe API key from environment variable
        String stripeSecretKey = System.getProperty("STRIPE_SECRET_KEY");
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            stripeSecretKey = System.getenv("STRIPE_SECRET_KEY");
        }
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            System.err.println("STRIPE_SECRET_KEY environment variable not set");
            ctx.response()
               .setStatusCode(500)
               .putHeader("Content-Type", "application/json")
               .end(new JsonObject()
                   .put("error", "Payment system not configured")
                   .encode());
            return;
        }
        
        Stripe.apiKey = stripeSecretKey;

        // Parse amount from request JSON body
        JsonObject body = ctx.getBodyAsJson();
        long amount = body != null && body.containsKey("amount")
                ? body.getLong("amount")
                : 200L;

        // Build PaymentIntent params
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount) // amount in cents
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .setAllowRedirects(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER
                        )
                        .build()
                )
                .build();

        // Run blocking Stripe API call off the event loop
        ctx.vertx().executeBlocking(promise -> {
            try {
                PaymentIntent intent = PaymentIntent.create(params);
                promise.complete(intent);
            } catch (Exception e) {
                promise.fail(e);
            }
        }, res -> {
            if (res.succeeded()) {
                PaymentIntent intent = (PaymentIntent) res.result();

                // Return only client_secret for frontend
                JsonObject response = new JsonObject()
                        .put("clientSecret", intent.getClientSecret());

                ctx.response()
                   .putHeader("Content-Type", "application/json")
                   .end(response.encode());
            } else {
                res.cause().printStackTrace();
                ctx.fail(res.cause());
            }
        });
    }
}