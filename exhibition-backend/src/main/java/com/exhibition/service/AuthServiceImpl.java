package com.exhibition.service;

import com.exhibition.MainVerticle;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLClient;
import org.mindrot.jbcrypt.BCrypt;

public class AuthServiceImpl implements AuthService {
    
    private final SQLClient jdbc;
    private final String adminEmail;
    private final String adminPassword;
    
    public AuthServiceImpl(SQLClient jdbc) {
        this.jdbc = jdbc;
        // Admin credentials are configured via environment variables to avoid hardcoding secrets in source.
        // Set ADMIN_EMAIL and ADMIN_PASSWORD in your runtime environment to enable admin login.
        this.adminEmail = System.getenv("ADMIN_EMAIL");
        this.adminPassword = System.getenv("ADMIN_PASSWORD");
    }
    
    @Override
    public void authenticateUser(String email, String password, Handler<AsyncResult<JsonObject>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                // Normalize inputs to avoid failures due to accidental spaces/case on email
                final String cleanEmail = email == null ? null : email.trim().toLowerCase();
                final String cleanPassword = password == null ? null : password.trim();

                System.out.println("Auth: login attempt email=" + cleanEmail + ", pwdLen=" + (cleanPassword == null ? 0 : cleanPassword.length()));

                // 1) Try attendee by email only, then verify password with BCrypt
                String attendeeQuery = "SELECT attendee_id as id, name, email, password, COALESCE(is_temporary_password, false) as is_temporary_password, COALESCE(password_changed, true) as password_changed, 'attendee' as role FROM attendee WHERE LOWER(email) = ?";

                jdbc.queryWithParams(attendeeQuery,
                    new JsonArray().add(cleanEmail),
                    attendeeResult -> {
                        if (attendeeResult.succeeded()) {
                            ResultSet rs = attendeeResult.result();
                            System.out.println("Auth: attendee rows fetched=" + rs.getNumRows());
                            if (rs.getNumRows() > 0) {
                                JsonObject row = rs.getRows().get(0);
                                String storedHash = row.getString("password");
                                System.out.println("Auth: attendee found - email=" + cleanEmail + ", storedHashLength=" + (storedHash != null ? storedHash.length() : 0));
                                System.out.println("Auth: storedHash starts with $2a$: " + (storedHash != null && storedHash.startsWith("$2a$")));
                                System.out.println("Auth: cleanPassword length: " + (cleanPassword != null ? cleanPassword.length() : 0));
                                
                                // Debug: Let's also try without trimming the password to see if that's the issue
                                String originalPassword = password == null ? null : password;
                                System.out.println("Auth: originalPassword length: " + (originalPassword != null ? originalPassword.length() : 0));
                                System.out.println("Auth: passwords equal: " + (cleanPassword != null && originalPassword != null && cleanPassword.equals(originalPassword)));
                                
                                boolean matches = false;
                                if (storedHash != null && cleanPassword != null) {
                                    try {
                                        matches = BCrypt.checkpw(cleanPassword, storedHash);
                                        System.out.println("Auth: BCrypt.checkpw result with trimmed password: " + matches);
                                        
                                        // If trimmed password fails, try original password
                                        if (!matches && originalPassword != null && !originalPassword.equals(cleanPassword)) {
                                            matches = BCrypt.checkpw(originalPassword, storedHash);
                                            System.out.println("Auth: BCrypt.checkpw result with original password: " + matches);
                                        }
                                    } catch (Exception e) {
                                        System.err.println("Auth: BCrypt.checkpw failed: " + e.getMessage());
                                    }
                                } else {
                                    System.out.println("Auth: storedHash or cleanPassword is null");
                                }

                                if (matches) {
                                    // Remove password before returning to frontend
                                    row.remove("password");
                                    // Map temporary password fields to camelCase for frontend
                                    row.put("isTemporaryPassword", row.getBoolean("is_temporary_password", false));
                                    row.put("passwordChanged", row.getBoolean("password_changed", true));
                                    promise.complete(row);
                                    return;
                                }
                            }
                        } else {
                            System.err.println("Auth: attendee query failed: " + attendeeResult.cause());
                        }
                        
                        // 2) Try exhibitor by email only, then verify password with BCrypt
                        String exhibitorQuery = "SELECT exhibitor_id as id, company_name as companyName, contact_person as contactPerson, email, booth_number, floor_number, logo_url, password, COALESCE(status, 'active') as status, COALESCE(password_changed, true) as password_changed, COALESCE(is_temporary_password, false) as is_temporary_password, 'exhibitor' as role FROM exhibitor WHERE LOWER(email) = ?";
                        
                        jdbc.queryWithParams(exhibitorQuery,
                            new JsonArray().add(cleanEmail),
                            exhibitorResult -> {
                                if (exhibitorResult.succeeded()) {
                                    ResultSet rs = exhibitorResult.result();
                                    System.out.println("Auth: exhibitor rows fetched=" + rs.getNumRows());
                                    if (rs.getNumRows() > 0) {
                                        JsonObject row = rs.getRows().get(0);
                                        String storedHash = row.getString("password");
                                        System.out.println("Auth: exhibitor found - email=" + cleanEmail + ", storedHashLength=" + (storedHash != null ? storedHash.length() : 0));
                                        System.out.println("Auth: storedHash starts with $2a$: " + (storedHash != null && storedHash.startsWith("$2a$")));
                                        
                                        boolean matches = false;
                                        if (storedHash != null && cleanPassword != null) {
                                            try {
                                                matches = BCrypt.checkpw(cleanPassword, storedHash);
                                                System.out.println("Auth: exhibitor BCrypt.checkpw result: " + matches);
                                            } catch (Exception e) {
                                                System.err.println("Auth: exhibitor BCrypt.checkpw failed: " + e.getMessage());
                                            }
                                        } else {
                                            System.out.println("Auth: exhibitor storedHash or cleanPassword is null");
                                        }

                                        if (matches) {
                                            // Remove password before returning to frontend
                                            row.remove("password");
                                            // Map temporary password fields to camelCase for frontend
                                            row.put("isTemporaryPassword", row.getBoolean("is_temporary_password", false));
                                            row.put("passwordChanged", row.getBoolean("password_changed", true));
                                            promise.complete(row);
                                            return;
                                        }
                                    }
                                }
                                
                                // 3) Fallback to admin credentials (still plain from env)
                                if (adminEmail != null && adminPassword != null
                                    && adminEmail.trim().equalsIgnoreCase(cleanEmail)
                                    && adminPassword.equals(cleanPassword)) {
                                    JsonObject adminUser = new JsonObject()
                                        .put("id", 0)
                                        .put("name", "Admin User")
                                        .put("email", cleanEmail)
                                        .put("role", "admin");
                                    promise.complete(adminUser);
                                    return;
                                }
                                
                                promise.fail("Invalid credentials");
                            });
                    });
                    
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }
    
    @Override
    public void getUserById(int userId, Handler<AsyncResult<JsonObject>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String attendeeQuery = "SELECT attendee_id as id, company_name as companyName, email, 'attendee' as role FROM attendee WHERE attendee_id = ?";
                
                jdbc.queryWithParams(attendeeQuery, 
                    new io.vertx.core.json.JsonArray().add(userId),
                    attendeeResult -> {
                        if (attendeeResult.succeeded()) {
                            ResultSet rs = attendeeResult.result();
                            if (rs.getNumRows() > 0) {
                                JsonObject row = rs.getRows().get(0);
                                promise.complete(row);
                                return;
                            }
                        }
                        
                        String exhibitorQuery = "SELECT exhibitor_id as id, company_name as companyName, contact_person as contactPerson, email, booth_number as boothNumber, floor_number as floorNumber, logo_url as logoUrl, COALESCE(status, 'active') as status, COALESCE(password_changed, true) as password_changed, COALESCE(is_temporary_password, false) as is_temporary_password, 'exhibitor' as role FROM exhibitor WHERE exhibitor_id = ?";
                        
                        jdbc.queryWithParams(exhibitorQuery, 
                            new io.vertx.core.json.JsonArray().add(userId),
                            exhibitorResult -> {
                                if (exhibitorResult.succeeded()) {
                                    ResultSet rs = exhibitorResult.result();
                                    if (rs.getNumRows() > 0) {
                                        JsonObject row = rs.getRows().get(0);
                                        // Map temporary password fields to camelCase for frontend (matching login query)
                                        row.put("isTemporaryPassword", row.getBoolean("is_temporary_password", false));
                                        row.put("passwordChanged", row.getBoolean("password_changed", true));
                                        promise.complete(row);
                                        return;
                                    }
                                }
                                
                                promise.fail("User not found");
                            });
                    });
                    
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }
    
    @Override
    public void updateUserRole(int userId, String role, Handler<AsyncResult<Void>> resultHandler) {
        resultHandler.handle(io.vertx.core.Future.succeededFuture());
    }
    
    @Override
    public void getUserStatus(int userId, Handler<AsyncResult<JsonObject>> resultHandler) {
        MainVerticle.vertx.executeBlocking(promise -> {
            try {
                String attendeeQuery = "SELECT 'attendee' as role, 'active' as status FROM attendee WHERE attendee_id = ?";
                
                jdbc.queryWithParams(attendeeQuery, 
                    new io.vertx.core.json.JsonArray().add(userId),
                    attendeeResult -> {
                        if (attendeeResult.succeeded()) {
                            ResultSet rs = attendeeResult.result();
                            if (rs.getNumRows() > 0) {
                                JsonObject statusData = new JsonObject()
                                    .put("role", "attendee")
                                    .put("status", "active"); 
                                promise.complete(statusData);
                                return;
                            }
                        }
                        
                        String exhibitorQuery = "SELECT 'exhibitor' as role, COALESCE(status, 'active') as status FROM exhibitor WHERE exhibitor_id = ?";
                        
                        jdbc.queryWithParams(exhibitorQuery, 
                            new io.vertx.core.json.JsonArray().add(userId),
                            exhibitorResult -> {
                                if (exhibitorResult.succeeded()) {
                                    ResultSet rs = exhibitorResult.result();
                                    if (rs.getNumRows() > 0) {
                                        JsonObject row = rs.getRows().get(0);
                                        String status = row.getString("status");
                                        // Ensure status is never null - default to 'active'
                                        if (status == null || status.trim().isEmpty()) {
                                            status = "active";
                                        }
                                        JsonObject statusData = new JsonObject()
                                            .put("role", "exhibitor")
                                            .put("status", status);
                                        promise.complete(statusData);
                                        return;
                                    }
                                }
                                
                                promise.fail("User not found");
                            });
                    });
                    
            } catch (Exception e) {
                promise.fail(e);
            }
        }, resultHandler);
    }
} 