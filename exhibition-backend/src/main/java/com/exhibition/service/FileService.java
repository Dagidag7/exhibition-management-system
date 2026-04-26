package com.exhibition.service;

import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.ext.web.FileUpload;

/**
 * Service interface for file operations
 * Handles upload, retrieval, and deletion of files
 */
public interface FileService {
    
    /**
     * Upload a file and save it to the file system
     * @param upload The file upload from the request
     * @param category The category/folder to save the file (logos, products, sponsors, landing, misc)
     * @param handler The handler that returns the file URL on success
     */
    void uploadFile(FileUpload upload, String category, Handler<AsyncResult<String>> handler);
    
    /**
     * Delete a file from the file system
     * @param fileUrl The URL or path of the file to delete
     * @param handler The handler that returns success or failure
     */
    void deleteFile(String fileUrl, Handler<AsyncResult<Void>> handler);
    
    /**
     * Get file information
     * @param fileUrl The URL or path of the file
     * @param handler The handler that returns file information
     */
    void getFileInfo(String fileUrl, Handler<AsyncResult<String>> handler);
}







