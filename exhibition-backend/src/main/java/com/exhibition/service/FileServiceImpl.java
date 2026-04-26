package com.exhibition.service;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.FileUpload;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.Set;

/**
 * Implementation of FileService for handling file operations
 */
public class FileServiceImpl implements FileService {
    
    private final Vertx vertx;
    private final String baseUploadPath;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", 
        "image/bmp", "image/svg+xml"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    public FileServiceImpl(Vertx vertx) {
        this.vertx = vertx;
        this.baseUploadPath = "images";
        initializeDirectories();
    }
    
    /**
     * Initialize upload directories if they don't exist
     */
    private void initializeDirectories() {
        try {
            Path uploadPath = Paths.get(baseUploadPath);
            Files.createDirectories(uploadPath.resolve("logos"));
            Files.createDirectories(uploadPath.resolve("products"));
            Files.createDirectories(uploadPath.resolve("sponsors"));
            Files.createDirectories(uploadPath.resolve("landing"));
            Files.createDirectories(uploadPath.resolve("misc"));
            System.out.println("File upload directories initialized successfully");
        } catch (Exception e) {
            System.err.println("Failed to initialize upload directories: " + e.getMessage());
        }
    }
    
    @Override
    public void uploadFile(FileUpload upload, String category, Handler<AsyncResult<String>> handler) {
        vertx.executeBlocking(promise -> {
            Path destinationPath = null; // Declare outside try block for use in catch
            try {
                // Validate file type
                if (!ALLOWED_IMAGE_TYPES.contains(upload.contentType())) {
                    promise.fail("Invalid file type. Only images are allowed.");
                    return;
                }
                
                // Validate file size
                File uploadedFile = new File(upload.uploadedFileName());
                long fileSize = uploadedFile.length();
                if (fileSize > MAX_FILE_SIZE) {
                    promise.fail("File size exceeds maximum limit of 10MB.");
                    return;
                }
                
                // Validate category
                Set<String> validCategories = Set.of("logos", "products", "sponsors", "landing", "misc");
                String finalCategory = category != null && !category.isEmpty() ? category.toLowerCase() : "misc";
                if (!validCategories.contains(finalCategory)) {
                    // If category not provided or invalid, try to determine from filename
                    String originalFilename = upload.fileName();
                    finalCategory = determineCategory(originalFilename);
                }
                
                // Generate unique filename
                String originalFilename = upload.fileName();
                String fileExtension = getFileExtension(originalFilename);
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                
                // Create destination path
                destinationPath = Paths.get(baseUploadPath, finalCategory, uniqueFilename);
                
                // Ensure destination directory exists
                Files.createDirectories(destinationPath.getParent());
                
                // Copy file to destination
                Files.copy(
                    Paths.get(upload.uploadedFileName()),
                    destinationPath,
                    StandardCopyOption.REPLACE_EXISTING
                );
                
                // Delete temporary uploaded file
                Files.deleteIfExists(Paths.get(upload.uploadedFileName()));
                
                // Return file URL relative to the static handler
                String fileUrl = "/images/" + finalCategory + "/" + uniqueFilename;
                System.out.println("File uploaded successfully to: " + destinationPath.toString());
                System.out.println("Returning URL: " + fileUrl);
                promise.complete(fileUrl);
                
            } catch (Exception e) {
                System.err.println("Error uploading file: " + e.getMessage());
                System.err.println("Source: " + upload.uploadedFileName());
                System.err.println("Destination: " + (destinationPath != null ? destinationPath.toString() : "null"));
                e.printStackTrace();
                promise.fail("Failed to upload file: " + e.getMessage());
            }
        }, false, handler);
    }
    
    @Override
    public void deleteFile(String fileUrl, Handler<AsyncResult<Void>> handler) {
        vertx.executeBlocking(promise -> {
            try {
                // Remove leading slash if present
                String cleanPath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
                Path filePath = Paths.get(cleanPath);
                
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    promise.complete();
                } else {
                    promise.fail("File not found: " + fileUrl);
                }
            } catch (Exception e) {
                System.err.println("Error deleting file: " + e.getMessage());
                promise.fail("Failed to delete file: " + e.getMessage());
            }
        }, false, handler);
    }
    
    @Override
    public void getFileInfo(String fileUrl, Handler<AsyncResult<String>> handler) {
        vertx.executeBlocking(promise -> {
            try {
                String cleanPath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
                Path filePath = Paths.get(cleanPath);
                
                if (Files.exists(filePath)) {
                    long fileSize = Files.size(filePath);
                    String fileInfo = String.format("File: %s, Size: %d bytes", filePath, fileSize);
                    promise.complete(fileInfo);
                } else {
                    promise.fail("File not found: " + fileUrl);
                }
            } catch (Exception e) {
                promise.fail("Failed to get file info: " + e.getMessage());
            }
        }, false, handler);
    }
    
    /**
     * Extract file extension from filename
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1) return "";
        return filename.substring(lastDot);
    }
    
    /**
     * Determine upload category based on filename
     * This can be enhanced with query parameters or form data
     */
    private String determineCategory(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.contains("logo") || lowerFilename.contains("company")) {
            return "logos";
        } else if (lowerFilename.contains("product")) {
            return "products";
        } else if (lowerFilename.contains("sponsor")) {
            return "sponsors";
        } else if (lowerFilename.contains("landing") || lowerFilename.contains("banner")) {
            return "landing";
        }
        return "misc";
    }
}







