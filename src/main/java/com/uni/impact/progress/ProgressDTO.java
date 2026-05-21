package com.uni.impact.progress;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class ProgressDTO {

    private Long progressId;

    @NotNull
    private Integer percentage;

    private String notes;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private LocalDateTime updatedAt;

    @NotNull
    private Long campaign;

    @NotNull
    private Long updatedBy;

}
