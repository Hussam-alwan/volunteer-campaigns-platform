package com.uni.impact.category;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class CategoryResponseDTO {

    private Long categoryId;

    private String name;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
