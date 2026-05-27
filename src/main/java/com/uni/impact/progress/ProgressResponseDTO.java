package com.uni.impact.progress;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ProgressResponseDTO {

    private Long progressId;

    private Integer percentage;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long campaign;

    private Long updatedBy;

}
