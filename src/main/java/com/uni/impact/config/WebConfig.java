package com.uni.impact.config;

import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path absolute = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(absolute);
        } catch (IOException e) {
            log.warn("Unable to create upload directory {}: {}", absolute, e.getMessage());
        }
        String uploadPath = absolute.toUri().toString();
        if (!uploadPath.endsWith("/")) {
            uploadPath = uploadPath + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(3600);
    }
}
