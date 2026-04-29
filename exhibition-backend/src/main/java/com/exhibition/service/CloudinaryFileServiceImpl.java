package com.exhibition.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.FileUpload;
import java.io.File;
import java.util.Map;
import java.util.Set;

/**
 * Cloudinary-based implementation of FileService
 * Stores images in Cloudinary cloud storage instead of local disk
 */
public class CloudinaryFileServiceImpl implements FileService {
    
    private final Vertx vertx;
    private final Cloudinary cloudinary;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", 
        "image/bmp", "image/svg+xml"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    public CloudinaryFileServiceImpl(Vertx vertx) {
        this.vertx = vertx;
        
        // Get Cloudinary credentials from environment variables
        String cloudName = getEnvVar("CLOUDINARY_CLOUD_NAME");
        String apiKey = getEnvVar("CLOUDINARY_API_KEY");
        String apiSecret = getEnvVar("CLOUDINARY_API_SECRET");
        
        if (cloudName == null || apiKey == null || apiSecret == null) {
            System.err.println("ERROR: Cloudinary credentials not found in environment variables!");
            System.err.println("Please set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
            throw new RuntimeException("Cloudinary credentials not configured");
        }
        
        // Initialize Cloudinary
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
        
        System.out.println("Cloudinary initialized successfully with cloud: " + cloudName);
    }
    
    private String getEnvVar(String key) {
        // Try system property first, then environment variable
        String value = System.getProperty(key);
        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }
        return value;
    }
    
    @Override
    public void uploadFile(FileUpload upload, String category, Handler<AsyncResult<String>> handler) {
        vertx.executeBlocking(promise -> {
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
                    String originalFilename = upload.fileName();
                    finalCategory = determineCategory(originalFilename);
                }
                
                System.out.println("Uploading file to Cloudinary...");
                System.out.println("Category: " + finalCategory);
                System.out.println("Original filename: " + upload.fileName());
                System.out.println("Temp file: " + upload.uploadedFileName());
                
                // Upload to Cloudinary
                // Use folder parameter to organize images by category
                Map uploadResult = cloudinary.uploader().upload(uploadedFile, ObjectUtils.asMap(
                    "folder", "exhibition/" + finalCategory,
                    "resource_type", "image",
                    "use_filename", false,
                    "unique_filename", true
                ));
                
                // Get the secure URL from Cloudinary
                String fileUrl = (String) uploadResult.get("secure_url");
                
                System.out.println("File uploaded successfully to Cloudinary");
                System.out.println("Cloudinary URL: " + fileUrl);
                
                // Delete temporary uploaded file
                if (uploadedFile.exists()) {
                    uploadedFile.delete();
                }
                
                promise.complete(fileUrl);
                
            } catch (Exception e) {
                System.err.println("Error uploading file to Cloudinary: " + e.getMessage());
                e.printStackTrace();
                promise.fail("Failed to upload file: " + e.getMessage());
            }
        }, false, handler);
    }
    
    @Override
    public void deleteFile(String fileUrl, Handler<AsyncResult<Void>> handler) {
        vertx.executeBlocking(promise -> {
            try {
                // Extract public_id from Cloudinary URL
                // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
                String publicId = extractPublicIdFromUrl(fileUrl);
                
                if (publicId == null) {
                    promise.fail("Invalid Cloudinary URL: " + fileUrl);
                    return;
                }
                
                System.out.println("Deleting file from Cloudinary: " + publicId);
                
                // Delete from Cloudinary
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                String resultStatus = (String) result.get("result");
                
                if ("ok".equals(resultStatus) || "not found".equals(resultStatus)) {
                    System.out.println("File deleted successfully from Cloudinary");
                    promise.complete();
                } else {
                    promise.fail("Failed to delete file from Cloudinary: " + resultStatus);
                }
                
            } catch (Exception e) {
                System.err.println("Error deleting file from Cloudinary: " + e.getMessage());
                e.printStackTrace();
                promise.fail("Failed to delete file: " + e.getMessage());
            }
        }, false, handler);
    }
    
    @Override
    public void getFileInfo(String fileUrl, Handler<AsyncResult<String>> handler) {
        vertx.executeBlocking(promise -> {
            try {
                String publicId = extractPublicIdFromUrl(fileUrl);
                
                if (publicId == null) {
                    promise.fail("Invalid Cloudinary URL: " + fileUrl);
                    return;
                }
                
                // Get resource info from Cloudinary
                Map result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
                
                long bytes = ((Number) result.get("bytes")).longValue();
                String format = (String) result.get("format");
                int width = ((Number) result.get("width")).intValue();
                int height = ((Number) result.get("height")).intValue();
                
                String fileInfo = String.format(
                    "File: %s, Size: %d bytes, Format: %s, Dimensions: %dx%d",
                    publicId, bytes, format, width, height
                );
                
                promise.complete(fileInfo);
                
            } catch (Exception e) {
                promise.fail("Failed to get file info: " + e.getMessage());
            }
        }, false, handler);
    }
    
    /**
     * Extract public_id from Cloudinary URL
     * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/exhibition/logos/abc123.jpg
     * Returns: exhibition/logos/abc123
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            if (url == null || !url.contains("cloudinary.com")) {
                return null;
            }
            
            // Find the position after "/upload/"
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                return null;
            }
            
            // Skip "/upload/v{version}/" or "/upload/"
            String afterUpload = url.substring(uploadIndex + 8); // 8 = length of "/upload/"
            
            // Skip version number if present (e.g., "v1234567890/")
            if (afterUpload.startsWith("v") && afterUpload.indexOf("/") > 0) {
                afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
            }
            
            // Remove file extension
            int lastDot = afterUpload.lastIndexOf(".");
            if (lastDot > 0) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            
            return afterUpload;
            
        } catch (Exception e) {
            System.err.println("Error extracting public_id from URL: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Determine upload category based on filename
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
