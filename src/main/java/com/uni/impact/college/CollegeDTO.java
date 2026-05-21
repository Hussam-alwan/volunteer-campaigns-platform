package com.uni.impact.college;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;


@Getter
@Setter
public class CollegeDTO {

    private Long collegeId;

    @NotNull
    @Size(max = 255)
    private String name;

    private String description;

    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private OffsetDateTime updatedAt;

}
