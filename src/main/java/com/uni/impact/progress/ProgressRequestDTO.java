package com.uni.impact.progress;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class ProgressRequestDTO {

    @NotNull
    private Integer percentage;

    private String notes;

    @NotNull
    private Long campaign;

    @NotNull
    private Long updatedBy;

}
