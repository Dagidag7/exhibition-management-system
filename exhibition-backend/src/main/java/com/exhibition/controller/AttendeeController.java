package com.exhibition.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import javax.imageio.ImageIO;

import com.exhibition.model.Attendee;
import com.exhibition.service.AttendeeService;
import com.exhibition.service.ExhibitorService;
import com.exhibition.service.ExhibitorServiceImpl;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

public class AttendeeController {

    public static void registerRoutes(Router router, AttendeeService attendeeService, ExhibitorService exhibitorService) {
        router.post("/attendees").handler(ctx -> createAttendee(ctx, attendeeService));
        router.get("/attendees").handler(ctx -> getAllAttendees(ctx, attendeeService));
        router.get("/attendees/:id").handler(ctx -> getAttendeeById(ctx, attendeeService));
        router.get("/attendees/:id/receipt").handler(ctx -> downloadAttendeeReceipt(ctx, attendeeService));
        router.put("/attendees/:id").handler(ctx -> updateAttendee(ctx, attendeeService));
        router.delete("/attendees/:id").handler(ctx -> deleteAttendee(ctx, attendeeService));
        router.post("/attendees/api/payment").handler(ctx ->  handlePayment(ctx, attendeeService));
        router.post("/attendees/reset-password").handler(ctx -> resetAttendeePassword(ctx, attendeeService, exhibitorService));
        router.put("/attendees/:id/password").handler(ctx -> changeAttendeePassword(ctx, attendeeService));
        router.put("/attendees/payment-fee").handler(ctx -> updatePaymentFee(ctx, attendeeService));
    }
//  private static void handlePayment(RoutingContext ctx) {
    // ⚠️ NEVER hardcode your secret key in production!
    // Stripe.apiKey = "YOUR_STRIPE_SECRET_KEY";

    // // Get amount from request, default to $2.00
    // String amountParam = ctx.request().getParam("amount");
    // long amount = (amountParam != null) ? Long.parseLong(amountParam) : 200L;

    // // Stripe params
    // PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
    //         .setAmount(amount) // amount in cents
    //         .setCurrency("usd")
    //         .setPaymentMethod("pm_card_visa") // test payment method
    //         .setConfirm(true)
    //         .setAutomaticPaymentMethods(
    //             PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
    //                 .setEnabled(true)
    //                 .setAllowRedirects(
    //                     PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER
    //                 )
    //                 .build()
    //         )
    //         .build();

    // Run blocking Stripe call on worker thread
//     ctx.vertx().executeBlocking(promise -> {
//         try {
//             PaymentIntent intent = PaymentIntent.create(params);
//             promise.complete(intent);
//         } catch (Exception e) {
//             promise.fail(e);
//         }





//     }, res -> {
//         if (res.succeeded()) {
//             PaymentIntent intent = (PaymentIntent) res.result();
//             boolean paid = "succeeded".equals(intent.getStatus());

//             System.out.println("Payment status: " + intent.getStatus());
//             System.out.println("Is paid: " + paid);

//             ctx.json(intent); // return intent JSON to client
//         } else {
//             res.cause().printStackTrace();
//             ctx.fail(res.cause());
//         }
//     });
// }

private static void handlePayment(RoutingContext ctx, AttendeeService attendeeService) {
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

    // Parse amount from request JSON body (or fallback to $2.00)
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



private static void createAttendee(RoutingContext ctx, AttendeeService attendeeService) {
    String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
    
    if (body == null || body.trim().isEmpty()) {
        ctx.response()
           .setStatusCode(400)
           .putHeader("content-type", "application/json")
           .end("{\"error\": \"Request body is required\"}");
        return;
    }
    
    try {
        Attendee attendee = Json.decodeValue(body, Attendee.class);
        
        // Basic full name validation (allow letters, spaces, hyphens, apostrophes, and common accented characters)
        String name = attendee.getName() != null ? attendee.getName().trim() : "";
        if (name.isEmpty() || !name.matches("^[A-Za-z\\s\\-'àáâäèéêëìíîïòóôöùúûüñç]+$")) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Invalid full name\"}");
            return;
        }
        attendee.setName(name);
        
        // Check if email already exists before proceeding with registration
        attendeeService.getAttendeeByEmail(attendee.getEmail(), emailCheckResult -> {
            if (emailCheckResult.succeeded()) {
                // Email already exists
                ctx.response()
                   .setStatusCode(400)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"This email is already registered. Please use a different email or try logging in.\"}");
                return;
            }
            
            // Email doesn't exist, proceed with registration
            attendeeService.registerAttendee(attendee, res -> {
            if (res.succeeded()) {
                ctx.response()
                   .setStatusCode(201)
                   .putHeader("content-type", "application/json")
                   .end("{\"message\": \"Attendee created successfully\"}");
            } else {
                String rawMsg = res.cause() != null ? String.valueOf(res.cause().getMessage()) : "";
                String msg = rawMsg.toLowerCase();

                // Friendly messages for duplicate email/phone (unique constraint violation)
                if (msg.contains("uq_attendee_email") || (msg.contains("duplicate") && msg.contains("email")) || (msg.contains("unique") && msg.contains("email"))) {
                    ctx.response()
                       .setStatusCode(400)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"This email is already registered. Please use a different email or try logging in.\"}");
                    return;
                }
                if (msg.contains("uq_attendee_phone") || (msg.contains("duplicate") && msg.contains("phone")) || (msg.contains("unique") && msg.contains("phone"))) {
                    ctx.response()
                       .setStatusCode(400)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"This phone number is already registered. Please use a different phone number.\"}");
                    return;
                }

                // Default error response
                ctx.response()
                   .setStatusCode(500)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Registration failed\"}");
            }
        });
        }); // Close email check block
    } catch (Exception e) {
        ctx.response()
           .setStatusCode(400)
           .putHeader("content-type", "application/json")
           .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
    }
}
    private static void getAllAttendees(RoutingContext ctx, AttendeeService attendeeService) {
        attendeeService.listAttendees(res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(500).end(res.cause().getMessage());
            }
        });
    }

    private static void getAttendeeById(RoutingContext ctx, AttendeeService attendeeService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        attendeeService.getAttendee(id, res -> {
            if (res.succeeded()) {
                ctx.response().putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(res.result()));
            } else {
                ctx.response().setStatusCode(404).end("Attendee not found");
            }
        });
    }

    private static void downloadAttendeeReceipt(RoutingContext ctx, AttendeeService attendeeService) {
        int id;
        try {
            id = Integer.parseInt(ctx.pathParam("id"));
        } catch (NumberFormatException e) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Invalid attendee id\"}");
            return;
        }

        attendeeService.getAttendee(id, res -> {
            if (res.succeeded() && res.result() != null) {
                com.exhibition.model.Attendee attendee = res.result();

                String receiptId = "RCP-A-" + attendee.getAttendeeId();
                String registrationDate = attendee.getRegistrationDate() != null
                    ? attendee.getRegistrationDate()
                    : LocalDate.now().format(DateTimeFormatter.ISO_DATE);
                String amountStr = attendee.getPaymentFee() != null
                    ? String.format("%.2f", attendee.getPaymentFee())
                    : "0.00";

                String[] lines = new String[] {
                    "EXHIBITION REGISTRATION RECEIPT",
                    "================================",
                    "",
                    "Receipt ID: " + receiptId,
                    "Date: " + registrationDate,
                    "",
                    "Attendee Information:",
                    "  Name:  " + (attendee.getName() == null ? "" : attendee.getName()),
                    "  Email: " + (attendee.getEmail() == null ? "" : attendee.getEmail()),
                    "  Phone: " + (attendee.getPhone() == null ? "" : attendee.getPhone()),
                    "",
                    "Payment Information:",
                    "  Amount Paid: $" + amountStr,
                    "",
                    "This receipt confirms your registration and payment.",
                    "Present this at the exhibition entrance.",
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
                                  "attachment; filename=\"attendee-receipt-" + attendee.getAttendeeId() + ".png\"")
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
                   .end("{\"error\": \"Attendee not found\"}");
            }
        });
    }

    private static void updateAttendee(RoutingContext ctx, AttendeeService attendeeService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBodyAsString();
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            Attendee attendee = Json.decodeValue(body, Attendee.class);
            attendee.setAttendeeId(id);
            
            attendeeService.updateAttendee(attendee, res -> {
                if (res.succeeded()) {
                    // Return the updated attendee object
                    attendeeService.getAttendee(id, fetchRes -> {
                        if (fetchRes.succeeded()) {
                            ctx.response()
                               .putHeader("content-type", "application/json")
                               .end(Json.encodePrettily(fetchRes.result()));
                        } else {
                            ctx.response()
                               .setStatusCode(500)
                               .putHeader("content-type", "application/json")
                               .end("{\"error\": \"Failed to retrieve updated attendee\"}");
                        }
                    });
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

    private static void deleteAttendee(RoutingContext ctx, AttendeeService attendeeService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        attendeeService.removeAttendee(id, res -> {
            if (res.succeeded()) {
                ctx.response()
                   .putHeader("content-type", "application/json")
                   .end("{\"message\": \"Attendee deleted successfully\"}");
            } else {
                ctx.response()
                   .setStatusCode(500)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"" + res.cause().getMessage() + "\"}");
            }
        });
    }

    private static void resetAttendeePassword(RoutingContext ctx, AttendeeService attendeeService, ExhibitorService exhibitorService) {
        JsonObject body = ctx.getBodyAsJson();
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

        // Use the unified reset logic from ExhibitorServiceImpl
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

    private static void changeAttendeePassword(RoutingContext ctx, AttendeeService attendeeService) {
        int id = Integer.parseInt(ctx.pathParam("id"));
        String body = ctx.getBody() != null ? ctx.getBody().toString() : null;
        
        System.out.println("Change password request for attendee ID: " + id);
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
            
            attendeeService.updateAttendeePassword(id, newPassword, res -> {
                if (res.succeeded()) {
                    System.out.println("Password updated successfully for attendee ID: " + id);
                    ctx.response()
                    .putHeader("content-type", "application/json")
                    .end("{\"message\": \"Password changed successfully\"}");
                } else {
                    System.err.println("Failed to update password for attendee ID " + id + ": " + res.cause().getMessage());
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

    private static void updatePaymentFee(RoutingContext ctx, AttendeeService attendeeService) {
        String body = ctx.getBodyAsString();
        
        if (body == null || body.trim().isEmpty()) {
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Request body is required\"}");
            return;
        }
        
        try {
            JsonObject jsonBody = ctx.getBodyAsJson();
            String email = jsonBody.getString("email");
            Double paymentFee = jsonBody.getDouble("paymentFee");
            
            if (email == null || email.trim().isEmpty()) {
                ctx.response()
                   .setStatusCode(400)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Email is required\"}");
                return;
            }
            
            if (paymentFee == null || paymentFee < 0) {
                ctx.response()
                   .setStatusCode(400)
                   .putHeader("content-type", "application/json")
                   .end("{\"error\": \"Valid payment fee amount is required\"}");
                return;
            }
            
            attendeeService.updatePaymentFeeByEmail(email, paymentFee, res -> {
                if (res.succeeded()) {
                    ctx.response()
                       .putHeader("content-type", "application/json")
                       .end("{\"message\": \"Payment fee updated successfully\"}");
                } else {
                    ctx.response()
                       .setStatusCode(500)
                       .putHeader("content-type", "application/json")
                       .end("{\"error\": \"Failed to update payment fee: " + res.cause().getMessage() + "\"}");
                }
            });
        } catch (Exception e) {
            System.err.println("Error updating payment fee: " + e.getMessage());
            ctx.response()
               .setStatusCode(400)
               .putHeader("content-type", "application/json")
               .end("{\"error\": \"Invalid JSON format: " + e.getMessage() + "\"}");
        }
    }
}