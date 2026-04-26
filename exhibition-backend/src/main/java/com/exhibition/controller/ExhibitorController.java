package com.exhibition.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import javax.imageio.ImageIO;

import com.exhibition.model.Exhibitor;
import com.exhibition.service.ExhibitorService;

import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class ExhibitorController {

    public static void registerRoutes(Router router, ExhibitorService exhibitorService) {
        router.post("/exhibitors").handler(ctx -> createExhibitor(ctx, exhibitorService));
        router.get("/exhibitors").handler(ctx -> getAllExhibitors(ctx, exhibitorService));
        router.get("/exhibitors/:id").handler(ctx -> getExhibitorById(ctx, exhibitorService));
        router.get("/exhibitors/:id/receipt").handler(ctx -> downloadExhibitorReceipt(ctx, exhibitorService));
        router.put("/exhibitors/:id").handler(ctx -> updateExhibitor(ctx, exhibitorService));
        router.delete("/exhibitors/:id").handler(ctx -> deleteExhibitor(ctx, exhibitorService));
        router.put("/exhibitors/:id/password").handler(ctx -> changePassword(ctx, exhibitorService));
        router.post("/exhibitors/reset-password").handler(ctx -> resetExhibitorPassword(ctx, exhibitorService));
        router.post("/exhibitors/send-payment-request").handler(ctx -> sendPaymentRequest(ctx, exhibitorService));
    }

    private static void createExhibitor(RoutingContext ctx, ExhibitorService exhibitorService) {
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        System.err.println("body::::::::add"+body);
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
            .setStatusCode(400)
            .putHeader("content-type", "application/json")
            .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Exhibitor exhibitor = Json.decodeValue(body, Exhibitor.class);
            exhibitorService.registerExhibitor(exhibitor, res -> {
                if (res.succeeded()) {
                    ctx.response()
                    .setStatusCode(201)
                    .putHeader("content-type", "application/json")
                    .end("{\"message\": \"Exhibitor created successfully\"}");
                } else {
                    String rawMsg = res.cause() != null ? String.valueOf(res.cause().getMessage()) : "";
                    String msg = rawMsg.toLowerCase();

                    if (msg.contains("email already exists")) {
                        ctx.response()
                           .setStatusCode(400)
                           .putHeader("content-type", "application/json")
                           .end("{\"error\": \"Email already exists. Each exhibitor must have a unique email address.\"}");
                        return;
                    }

                    if (msg.contains("booth number already exists") || msg.contains("booth already assigned")) {
                        ctx.response()
                           .setStatusCode(400)
                           .putHeader("content-type", "application/json")
                           .end("{\"error\": \"Booth number already exists\"}");
                        return;
                    }
                    
                    if (msg.contains("floor capacity exceeded")) {
                        ctx.response()
                           .setStatusCode(400)
                           .putHeader("content-type", "application/json")
                           .end("{\"error\": \"Floor capacity exceeded\"}");
                        return;
                    }

                    ctx.response()
                       .setStatusCode(500)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"Failed to create exhibitor\"}");
                }
            });
        } catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
            e.printStackTrace();
            
            ctx.response()
            .setStatusCode(400)
            .putHeader("content-type", "application/json")
            .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void getAllExhibitors(RoutingContext ctx, ExhibitorService exhibitorService) {
        exhibitorService.listExhibitors(res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(500).end(res.cause().getMessage());
            }
        });
    }

    private static void getExhibitorById(RoutingContext ctx, ExhibitorService exhibitorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        exhibitorService.getExhibitor(id, res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(404).end("Exhibitor not found");
            }
        });
    }

    private static void downloadExhibitorReceipt(RoutingContext ctx, ExhibitorService exhibitorService) {
        int id;
        try {
            id = Integer.parseInt(ctx.pathParam("id"));
        } catch (NumberFormatException e) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Invalid exhibitor id\"}");
            return;
        }

        exhibitorService.getExhibitor(id, res -> {
            if (res.succeeded() && res.result() != null) {
                Exhibitor exhibitor = res.result();

                String receiptId = "RCP-E-" + exhibitor.getExhibitorId();
                String registrationDate = exhibitor.getRegistrationDate() != null
                    ? exhibitor.getRegistrationDate().toString()
                    : java.time.LocalDateTime.now().toString();

                String[] lines = new String[] {
                    "EXHIBITOR REGISTRATION RECEIPT",
                    "================================",
                    "",
                    "Receipt ID: " + receiptId,
                    "Date: " + registrationDate,
                    "",
                    "Exhibitor Information:",
                    "  Company: " + (exhibitor.getCompanyName() == null ? "" : exhibitor.getCompanyName()),
                    "  Contact: " + (exhibitor.getContactPerson() == null ? "" : exhibitor.getContactPerson()),
                    "  Email:   " + (exhibitor.getEmail() == null ? "" : exhibitor.getEmail()),
                    "",
                    "Booth Information:",
                    "  Floor: " + (exhibitor.getFloorNumber() == null ? "" : exhibitor.getFloorNumber()),
                    "  Booth: " + (exhibitor.getBoothNumber() == null ? "" : exhibitor.getBoothNumber()),
                    "",
                    "This receipt confirms your exhibitor registration",
                    "for the exhibition.",
                    "",
                    "Best regards,",
                    "Exhibition Team"
                };

                try {
                    int width = 800;
                    int lineHeight = 28;
                    int padding = 40;
                    int height = padding * 2 + lines.length * lineHeight;

                    BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g2d = image.createGraphics();

                    g2d.setColor(Color.WHITE);
                    g2d.fillRect(0, 0, width, height);

                    g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                    g2d.setColor(Color.BLACK);
                    g2d.setFont(new Font("Monospaced", Font.PLAIN, 18));

                    int y = padding;
                    for (String line : lines) {
                        g2d.drawString(line, padding, y);
                        y += lineHeight;
                    }

                    g2d.dispose();

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(image, "png", baos);
                    byte[] bytes = baos.toByteArray();

                    ctx.response()
                       .putHeader("Content-Type", "image/png")
                       .putHeader("Content-Disposition",
                                  "attachment; filename=\"exhibitor-receipt-" + exhibitor.getExhibitorId() + ".png\"")
                       .end(Buffer.buffer(bytes));
                } catch (Exception e) {
                    e.printStackTrace();
                    ctx.response()
                       .setStatusCode(500)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"Failed to generate receipt image\"}");
                }
            } else {
                ctx.response()
                   .setStatusCode(404)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Exhibitor not found\"}");
            }
        });
    }

    private static void updateExhibitor(RoutingContext ctx, ExhibitorService exhibitorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        System.err.println("body::::::::"+body);
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Exhibitor exhibitor = Json.decodeValue(body, Exhibitor.class);
            exhibitor.setExhibitorId(id);
    exhibitorService.updateExhibitor(exhibitor, res -> {
    if (res.succeeded()) {
        // Fetch and return the updated exhibitor to keep frontend state consistent
        exhibitorService.getExhibitor(id, fetchRes -> {
            if (fetchRes.succeeded() && fetchRes.result() != null) {
                ctx.response()
                   .putHeader("content-type", "application/json")
                   .end(Json.encodePrettily(fetchRes.result()));
            } else {
                ctx.response()
                   .putHeader("content-type", "application/json")
                   .end("{\"message\": \"Exhibitor updated successfully\"}");
            }
        });
    } else {
        String rawMsg = res.cause() != null ? String.valueOf(res.cause().getMessage()) : "";
        String msg = rawMsg.toLowerCase();
        
        if (msg.contains("booth number already exists") || msg.contains("booth already assigned")) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Booth number already exists\"}");
            return;
        }
        
        if (msg.contains("floor capacity exceeded")) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Floor capacity exceeded\"}");
            return;
        }
        
        ctx.response()
           .setStatusCode(500)
           .putHeader("content-type", "application/json")
           .end("{\"error\": \"Failed to update exhibitor\"}");
    }
});

        } catch (Exception e) {
            ctx.response()
            .setStatusCode(400)
            .putHeader("content-type", "application/json")
            .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void deleteExhibitor(RoutingContext ctx, ExhibitorService exhibitorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        exhibitorService.removeExhibitor(id, res -> {
            if (res.succeeded()) {
                ctx.response()
                .putHeader("content-type", "application/json")
                .end("{\"message\": \"Exhibitor deleted successfully\"}");
            } else {
                ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void changePassword(RoutingContext ctx, ExhibitorService exhibitorService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        
        System.out.println("Change password request for exhibitor ID: " + id);
        System.out.println("Request body: " + body);
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
            .setStatusCode(400)
            .putHeader("content-type", "application/json")
            .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            io.vertx.core.json.JsonObject jsonBody = new io.vertx.core.json.JsonObject(body);
            String newPassword = jsonBody.getString("password");
            
            System.out.println("New password extracted: " + (newPassword != null ? "***" : "null"));
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                ctx.response()
                .setStatusCode(400)
                .putHeader("content-type", "application/json")
                .end("{\"error\": \"Password is required\"}");
                return;
            }
            
            exhibitorService.updateExhibitorPassword(id, newPassword, res -> {
                if (res.succeeded()) {
                    System.out.println("Password updated successfully for exhibitor ID: " + id);
                    ctx.response()
                    .putHeader("content-type", "application/json")
                    .end("{\"message\": \"Password changed successfully\"}");
                } else {
                    System.err.println("Failed to update password for exhibitor ID " + id + ": " + res.cause().getMessage());
                    ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            System.err.println("Error parsing JSON in change password: " + e.getMessage());
            ctx.response()
            .setStatusCode(400)
            .putHeader("content-type", "application/json")
            .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }

    private static void resetExhibitorPassword(RoutingContext ctx, ExhibitorService exhibitorService) {
        io.vertx.core.json.JsonObject body = ctx.getBodyAsJson();
        if (body == null || !body.containsKey("email")) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Email is required\"}");
            return;
        }

        String email = body.getString("email");
        if (email == null || email.trim().isEmpty()) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Email cannot be empty\"}");
            return;
        }

        // Cast to ExhibitorServiceImpl to access the resetExhibitorPassword method
        if (exhibitorService instanceof com.exhibition.service.ExhibitorServiceImpl) {
            com.exhibition.service.ExhibitorServiceImpl exhibitorServiceImpl = (com.exhibition.service.ExhibitorServiceImpl) exhibitorService;
            exhibitorServiceImpl.resetExhibitorPassword(email.trim(), res -> {
                if (res.succeeded()) {
                    ctx.response()
                       .setStatusCode(200)
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"" + res.result() + "\"}");
                } else {
                    // Generic message to prevent email enumeration (security best practice)
                    ctx.response()
                       .setStatusCode(200)
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"If the email exists in our system, a password reset will be sent.\"}");
                }
            });
        } else {
            ctx.response()
               .setStatusCode(500)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Password reset not available\"}");
        }
    }

    private static void sendPaymentRequest(RoutingContext ctx, ExhibitorService exhibitorService) {
        try {
            io.vertx.core.json.JsonObject body = ctx.getBodyAsJson();
            String email = body.getString("email");
            String companyName = body.getString("companyName");
            String paymentLink = body.getString("paymentLink");
            
            if (email == null || email.trim().isEmpty()) {
                ctx.response()
                   .setStatusCode(400)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Email is required\"}");
                return;
            }
            
            if (paymentLink == null || paymentLink.trim().isEmpty()) {
                ctx.response()
                   .setStatusCode(400)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Payment link is required\"}");
                return;
            }
            
            exhibitorService.sendPaymentRequestEmail(email, companyName, paymentLink, res -> {
                if (res.succeeded()) {
                    ctx.response()
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"Payment request email sent successfully\"}");
                } else {
                    ctx.response()
                       .setStatusCode(500)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"Failed to send payment request email: " + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Invalid request: " + e.getMessage() + "\"}");
        }
    }
}
