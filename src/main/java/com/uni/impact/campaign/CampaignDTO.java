package com.uni.impact.campaign;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class CampaignDTO {

    private Long campaignId;

    @NotNull
    @Size(max = 255)
    private String title;

    private String description;

    @Size(max = 255)
    private String location;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private Integer maxVolunteers;

    @NotNull
    private CampaignStatus status;

    private LocalDateTime publishedAt;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private LocalDateTime updatedAt;

    @NotNull
    private Long proposedBy;

    private Long approvedBy;

    private Long managedBy;

    @NotNull
    private Long category;
}
