package com.uni.impact;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;


@SpringBootApplication
@EnableJpaAuditing
public class ImpactApplication {

    public static void main(final String[] args) {
        SpringApplication.run(ImpactApplication.class, args);
    }

}
