package com.uni.impact.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:}")
    private String springDatasourceUrl;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String springDatasourceUsername;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String springDatasourcePassword;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(resolveJdbcUrl());
        config.setUsername(resolveUsername());
        config.setPassword(resolvePassword());
        return new HikariDataSource(config);
    }

    private String resolveJdbcUrl() {
        String candidate = hasText(springDatasourceUrl)
                ? springDatasourceUrl
                : hasText(databaseUrl)
                ? databaseUrl
                : "jdbc:postgresql://localhost:5433/impact";

        if (candidate.startsWith("jdbc:")) {
            return candidate;
        }

        if (candidate.startsWith("postgres://") || candidate.startsWith("postgresql://")) {
            return toJdbcUrl(candidate);
        }

        return candidate;
    }

    private String resolveUsername() {
        if (hasText(springDatasourceUsername)) {
            return springDatasourceUsername;
        }

        if (hasText(databaseUrl) && !databaseUrl.startsWith("jdbc:")) {
            URI uri = URI.create(databaseUrl);
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                return userInfo.substring(0, userInfo.indexOf(':'));
            }
        }

        return "postgres";
    }

    private String resolvePassword() {
        if (hasText(springDatasourcePassword)) {
            return springDatasourcePassword;
        }

        if (hasText(databaseUrl) && !databaseUrl.startsWith("jdbc:")) {
            URI uri = URI.create(databaseUrl);
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                return userInfo.substring(userInfo.indexOf(':') + 1);
            }
        }

        return "P4ssword!";
    }

    private String toJdbcUrl(String url) {
        URI uri = URI.create(url);
        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String path = uri.getPath();
        String database = path != null && path.startsWith("/") ? path.substring(1) : path;

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
        jdbcUrl.append(host);
        if (port > 0) {
            jdbcUrl.append(':').append(port);
        }
        if (database != null && !database.isBlank()) {
            jdbcUrl.append('/').append(database);
        }
        if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
            jdbcUrl.append('?').append(uri.getQuery());
        }
        return jdbcUrl.toString();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
