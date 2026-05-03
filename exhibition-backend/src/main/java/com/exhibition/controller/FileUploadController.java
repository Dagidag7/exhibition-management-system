package com.exhibition.controller;

import com.exhibition.service.FileService;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.FileUpload;
import java.util.List;
import java.util.Set;

/**
 * Controller for handling file upload operations
 * Supports uploading images for logos, products, sponsors, and landing pages
 */
public class FileUploadController {

    public static void registerRoutes(Router router, FileService fileService) {
        // Upload single file
        router.post("/upload").handler(ctx -> uploadFile(ctx, fileService));
        
        // Upload with specific category
        router.post("/upload/:category").handler(ctx -> uploadFileWithCategory(ctx, fileService));
        
        // Delete file
        router.delete("/files/*").handler(ctx -> deleteFile(ctx, fileService));
        
        // Get file info
        router.get("/files/info").handler(ctx -> getFileInfo(ctx, fileService));
    }

    /**
     * Upload a file via multipart form data
     */
    private static void uploadFile(RoutingContext ctx, FileService fileService) {
        try {
            List<FileUpload> uploads = ctx.fileUploads();
            
            if (uploads == null || uploads.isEmpty()) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("content-type", "application/json")
                    .end(new JsonObject()
                        .put("error", "No file provided")
                        .encode());
                return;
            }
            
            // Get the first file
            FileUpload upload = uploads.get(0);
            
            // Use misc as default category when not specified
            fileService.uploadFile(upload, "misc", result -> {
                if (result.succeeded()) {
                    String fileUrl = result.result();
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("success", true)
                            .put("message", "File uploaded successfully")
                            .put("fileUrl", fileUrl)
                            .encode());
                } else {
                    ctx.response()
                        .setStatusCode(400)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("error", result.cause().getMessage())
                            .encode());
                }
            });
            
        } catch (Exception e) {
            System.err.println("Error in uploadFile handler: " + e.getMessage());
            e.printStackTrace();
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error: " + e.getMessage())
                    .encode());
        }
    }

    /**
     * Upload a file with specific category (logos, products, sponsors, landing, misc)
     */
    private static void uploadFileWithCategory(RoutingContext ctx, FileService fileService) {
        try {
            String category = ctx.pathParam("category");
            
            // Validate category
            Set<String> validCategories = Set.of("logos", "products", "sponsors", "landing", "misc");
            if (!validCategories.contains(category)) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("content-type", "application/json")
                    .end(new JsonObject()
                        .put("error", "Invalid category. Use: logos, products, sponsors, landing, or misc")
                        .encode());
                return;
            }
            
            List<FileUpload> uploads = ctx.fileUploads();
            
            if (uploads == null || uploads.isEmpty()) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("content-type", "application/json")
                    .end(new JsonObject()
                        .put("error", "No file provided")
                        .encode());
                return;
            }
            
            FileUpload upload = uploads.get(0);
            
            // Use the category from the path parameter
            fileService.uploadFile(upload, category, result -> {
                if (result.succeeded()) {
                    String fileUrl = result.result();
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("success", true)
                            .put("message", "File uploaded successfully")
                            .put("category", category)
                            .put("fileUrl", fileUrl)
                            .encode());
                } else {
                    ctx.response()
                        .setStatusCode(400)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("error", result.cause().getMessage())
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error: " + e.getMessage())
                    .encode());
        }
    }

    /**
     * Delete a file by URL
     */
    private static void deleteFile(RoutingContext ctx, FileService fileService) {
        try {
            String path = ctx.request().path();
            // Extract file path from /api/files/*
            String filePath = path.replace("/api/files/", "");
            
            // Reconstruct full URL
            String fileUrl = "/" + filePath;
            
            fileService.deleteFile(fileUrl, result -> {
                if (result.succeeded()) {
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("success", true)
                            .put("message", "File deleted successfully")
                            .encode());
                } else {
                    ctx.response()
                        .setStatusCode(400)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("error", result.cause().getMessage())
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error: " + e.getMessage())
                    .encode());
        }
    }

    /**
     * Get file information
     */
    private static void getFileInfo(RoutingContext ctx, FileService fileService) {
        try {
            String fileUrl = ctx.request().getParam("url");
            
            if (fileUrl == null || fileUrl.trim().isEmpty()) {
                ctx.response()
                    .setStatusCode(400)
                    .putHeader("content-type", "application/json")
                    .end(new JsonObject()
                        .put("error", "File URL parameter is required")
                        .encode());
                return;
            }
            
            fileService.getFileInfo(fileUrl, result -> {
                if (result.succeeded()) {
                    ctx.response()
                        .setStatusCode(200)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("info", result.result())
                            .encode());
                } else {
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("content-type", "application/json")
                        .end(new JsonObject()
                            .put("error", result.cause().getMessage())
                            .encode());
                }
            });
            
        } catch (Exception e) {
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(new JsonObject()
                    .put("error", "Internal server error: " + e.getMessage())
                    .encode());
        }
    }
}

