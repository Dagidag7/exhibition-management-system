package com.exhibition;

import com.exhibition.repository.AttendeeRepository;
import com.exhibition.repository.AttendeeRepositoryImpl;
import com.exhibition.repository.ConferenceRepository;
import com.exhibition.repository.ConferenceRepositoryImpl;
import com.exhibition.repository.ExhibitorRepository;
import com.exhibition.repository.ExhibitorRepositoryImpl;
import com.exhibition.repository.PartnerRepository;
import com.exhibition.repository.PartnerRepositoryImpl;
import com.exhibition.repository.ProductRepository;
import com.exhibition.repository.ProductRepositoryImpl;
import com.exhibition.repository.SpeakerRepository;
import com.exhibition.repository.SpeakerRepositoryImpl;
import com.exhibition.repository.SponsorRepository;
import com.exhibition.repository.SponsorRepositoryImpl;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.StaticHandler;
import java.util.HashSet;
import java.util.Set;
import com.exhibition.service.AttendeeService;
import com.exhibition.service.AttendeeServiceImpl;
import com.exhibition.service.ConferenceService;
import com.exhibition.service.ConferenceServiceImpl;
import com.exhibition.service.ExhibitorService;
import com.exhibition.service.ExhibitorServiceImpl;
import com.exhibition.service.FloorService;
import com.exhibition.service.PartnerService;
import com.exhibition.service.PartnerServiceImpl;
import com.exhibition.service.ProductService;
import com.exhibition.service.ProductServiceImpl;
import com.exhibition.service.SpeakerService;
import com.exhibition.service.SpeakerServiceImpl;
import com.exhibition.service.SponsorService;
import com.exhibition.service.SponsorServiceImpl;
import com.exhibition.service.AuthService;
import com.exhibition.service.AuthServiceImpl;
import com.exhibition.controller.AttendeeController;
import com.exhibition.controller.ConferenceController;
import com.exhibition.controller.ExhibitorController;
import com.exhibition.controller.FloorController;
import com.exhibition.controller.PartnerController;
import com.exhibition.controller.ProductController;
import com.exhibition.controller.SpeakerController;
import com.exhibition.controller.SponsorController;
import com.exhibition.controller.AuthController;
import com.exhibition.controller.DatabaseController;
import com.exhibition.controller.FileUploadController;
import com.exhibition.service.DatabaseService;
import com.exhibition.service.FileService;
import com.exhibition.service.FileServiceImpl;

import io.vertx.ext.web.handler.BodyHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.vertx.core.json.jackson.DatabindCodec;
import io.github.cdimascio.dotenv.Dotenv;

public class MainVerticle extends AbstractVerticle {

    // Load .env file for local development
    static {
        // Configure logging to reduce noise
        try {
            java.io.InputStream logConfig = MainVerticle.class.getClassLoader()
                .getResourceAsStream("logging.properties");
            if (logConfig != null) {
                java.util.logging.LogManager.getLogManager().readConfiguration(logConfig);
            }
        } catch (Exception e) {
            // Ignore logging configuration errors
        }
        
        // Reduce C3P0 logging noise
        System.setProperty("com.mchange.v2.log.MLog", "com.mchange.v2.log.FallbackMLog");
        System.setProperty("com.mchange.v2.log.FallbackMLog.DEFAULT_CUTOFF_LEVEL", "WARNING");
        
        try {
            // Try to load from exhibition-backend directory first
            Dotenv dotenv = null;
            try {
                dotenv = Dotenv.configure()
                    .directory("./exhibition-backend")
                    .ignoreIfMissing()
                    .load();
            } catch (Exception e) {
                // If that fails, try current directory
                dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMissing()
                    .load();
            }
            
            if (dotenv != null) {
                dotenv.entries().forEach(entry -> 
                    System.setProperty(entry.getKey(), entry.getValue())
                );
                System.out.println("✓ Loaded .env file successfully");
            }
        } catch (Exception e) {
            System.out.println("No .env file found, using system environment variables: " + e.getMessage());
        }
    }

    public static SQLClient jdbc; // For repository access
    public static Vertx vertx;    // For global Vertx access

    public static void main(String[] args) {
        // Configure Vertx with longer blocked thread checker timeout for initialization
        VertxOptions options = new VertxOptions()
            .setBlockedThreadCheckInterval(10000) // 10 seconds
            .setMaxEventLoopExecuteTime(10000);   // 10 seconds
        
        vertx = Vertx.vertx(options);
        vertx.deployVerticle(new MainVerticle());
    }

    @Override
    public void start() {
        vertx.executeBlocking(promise -> {
            try {
                // Explicitly load PostgreSQL driver
                try {
                    Class.forName("org.postgresql.Driver");
                    System.out.println("✓ PostgreSQL driver loaded successfully");
                } catch (ClassNotFoundException e) {
                    System.err.println("✗ PostgreSQL driver not found: " + e.getMessage());
                    throw new RuntimeException("PostgreSQL driver not found", e);
                }
                
                ObjectMapper mapper = DatabindCodec.mapper();
                mapper.registerModule(new JavaTimeModule());
                DatabindCodec.prettyMapper().registerModule(new JavaTimeModule());
                
                // Load database configuration from environment variables
                String dbUrl = System.getProperty("DB_URL");
                if (dbUrl == null || dbUrl.isBlank()) {
                    dbUrl = System.getenv("DB_URL");
                }
                
                // If DB_URL is not set, construct it from individual components
                if (dbUrl == null || dbUrl.isBlank()) {
                    String dbHost = System.getenv("DB_HOST");
                    String dbPort = System.getenv("DB_PORT");
                    String dbName = System.getenv("DB_NAME");
                    
                    if (dbHost != null && dbPort != null && dbName != null) {
                        dbUrl = String.format("jdbc:postgresql://%s:%s/%s", dbHost, dbPort, dbName);
                    } else {
                        dbUrl = "jdbc:postgresql://localhost:5432/exhibition_db";
                    }
                }

                String dbDriver = System.getProperty("DB_DRIVER");
                if (dbDriver == null || dbDriver.isBlank()) {
                    dbDriver = System.getenv("DB_DRIVER");
                }
                if (dbDriver == null || dbDriver.isBlank()) {
                    dbDriver = "org.postgresql.Driver";
                }

                String dbUser = System.getProperty("DB_USER");
                if (dbUser == null || dbUser.isBlank()) {
                    dbUser = System.getenv("DB_USER");
                }
                if (dbUser == null || dbUser.isBlank()) {
                    dbUser = "exhibition_system";
                }

                String dbPassword = System.getProperty("DB_PASSWORD");
                if (dbPassword == null || dbPassword.isBlank()) {
                    dbPassword = System.getenv("DB_PASSWORD");
                }
                if (dbPassword == null || dbPassword.isBlank()) {
                    throw new IllegalStateException("DB_PASSWORD environment variable must be set");
                }

                JsonObject config = new JsonObject()
                    .put("url", dbUrl)
                    .put("driver_class", dbDriver)
                    .put("user", dbUser)
                    .put("password", dbPassword)
                    .put("max_pool_size", 10)
                    .put("initial_pool_size", 3)
                    .put("min_pool_size", 2)
                    .put("max_idle_time", 300)
                    .put("acquire_increment", 1)
                    .put("acquire_retry_attempts", 3)
                    .put("acquire_retry_delay", 1000)
                    .put("provider_class", "io.vertx.ext.jdbc.spi.impl.C3P0DataSourceProvider");

                System.out.println("Connecting to database: " + dbUrl);
                System.out.println("Database user: " + dbUser);
                System.out.println("Database driver: " + dbDriver);

                // Create the JDBC client
                jdbc = JDBCClient.createShared(vertx, config);
                
                // Test the connection
                jdbc.getConnection(connRes -> {
                    if (connRes.succeeded()) {
                        System.out.println("✓ Database connection test successful!");
                        connRes.result().close();
                    } else {
                        System.err.println("✗ Database connection test failed: " + connRes.cause().getMessage());
                    }
                });
                
                promise.complete();
            } catch (Exception e) {
                promise.fail(e);
            }
        }, false, ar -> {
            if (ar.succeeded()) {
                // Continue with non-blocking operations
                setupRouter();
            } else {
                System.err.println("Failed to initialize backend: " + ar.cause().getMessage());
            }
        });
    }

    private void setupRouter() {
        Router router = Router.router(vertx);
        router.route("/images/*").handler(StaticHandler.create("images"));

        Set<String> allowedHeaders = new HashSet<>();
        allowedHeaders.add("x-requested-with");
        allowedHeaders.add("Access-Control-Allow-Origin");
        allowedHeaders.add("origin");
        allowedHeaders.add("Content-Type");
        allowedHeaders.add("accept");
        allowedHeaders.add("Authorization");

        // Get allowed origins from environment variable
        String allowedOriginsEnv = System.getProperty("ALLOWED_ORIGINS");
        if (allowedOriginsEnv == null || allowedOriginsEnv.isBlank()) {
            allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        }
        String allowedOrigins = (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank()) 
            ? allowedOriginsEnv 
            : "http://localhost:4200"; // Default for development

        System.out.println("CORS allowed origins: " + allowedOrigins);

        router.route().handler(
            CorsHandler.create(allowedOrigins)
            .allowedHeaders(allowedHeaders)
            .allowedMethod(io.vertx.core.http.HttpMethod.GET)
            .allowedMethod(io.vertx.core.http.HttpMethod.POST)
            .allowedMethod(io.vertx.core.http.HttpMethod.PUT)
            .allowedMethod(io.vertx.core.http.HttpMethod.DELETE)
        );

        // Configure BodyHandler to support file uploads
        router.route().handler(BodyHandler.create()
            .setUploadsDirectory("temp") // Temporary directory for uploaded files
            .setDeleteUploadedFilesOnEnd(true)); // Auto-delete temp files after processing

        // Initialize services
        AttendeeRepository attendeeRepo = new AttendeeRepositoryImpl();
        AttendeeService attendeeService = new AttendeeServiceImpl(attendeeRepo);
        
        ExhibitorRepository exhibitorRepo = new ExhibitorRepositoryImpl();
        ExhibitorService exhibitorService = new ExhibitorServiceImpl(exhibitorRepo);

        ProductRepository productRepo = new ProductRepositoryImpl();
        ProductService productService = new ProductServiceImpl(productRepo);

        ConferenceRepository conferenceRepo = new ConferenceRepositoryImpl(jdbc);
        ConferenceService conferenceService = new ConferenceServiceImpl(conferenceRepo);
 
        SpeakerRepository speakerRepo = new SpeakerRepositoryImpl(jdbc);
        SpeakerService speakerService = new SpeakerServiceImpl(speakerRepo);

        SponsorRepository sponsorRepo = new SponsorRepositoryImpl();
        SponsorService sponsorService = new SponsorServiceImpl(sponsorRepo);

        PartnerRepository partnerRepo = new PartnerRepositoryImpl();
        PartnerService partnerService = new PartnerServiceImpl(partnerRepo);

        FloorService floorService = new FloorService(jdbc);

        AuthService authService = new AuthServiceImpl(jdbc);
        
        DatabaseService databaseService = new DatabaseService(jdbc);

        // Initialize file upload service
        FileService fileService = new FileServiceImpl(vertx);

        // Add a root route for health check
        router.get("/").handler(ctx -> {
            JsonObject response = new JsonObject()
                .put("status", "OK")
                .put("message", "Exhibition Management System API")
                .put("version", "1.0.0")
                .put("timestamp", java.time.Instant.now().toString());
            
            ctx.response()
                .putHeader("Content-Type", "application/json")
                .end(response.encode());
        });

        // Register controllers
        AttendeeController.registerRoutes(router, attendeeService, exhibitorService);
        ExhibitorController.registerRoutes(router, exhibitorService);
        ProductController.registerRoutes(router, productService);
        ConferenceController.registerRoutes(router, conferenceService);
        SpeakerController.registerRoutes(router, speakerService, conferenceService);
        SponsorController.registerRoutes(router, sponsorService);
        PartnerController.registerRoutes(router, partnerService);
        FloorController.registerRoutes(router, floorService);
        AuthController.registerRoutes(router, authService);
        DatabaseController.registerRoutes(router, databaseService);
        FileUploadController.registerRoutes(router, fileService);

        // Start HTTP server
        vertx.createHttpServer()
            .requestHandler(router)
            .listen(8888, http -> {
                if (http.succeeded()) {
                    System.out.println("HTTP server started on port 8888");
                    System.out.println("Vert.x backend started and JDBC client is ready!");
                } else {
                    System.out.println("HTTP server failed to start: " + http.cause().getMessage());
                }
            });
    }
}
