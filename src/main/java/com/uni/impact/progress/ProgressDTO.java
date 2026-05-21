package com.uni.impact.progress;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;


@Getter
@Setter
public class ProgressDTO {

    private Long progressId;

    @NotNull
    private Integer percentage;

    private String notes;

    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private OffsetDateTime updatedAt;

    @NotNull
    private Long campaign;

    @NotNull
    private Long updatedBy;

}
