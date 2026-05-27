package com.uni.impact.campaign;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class CampaignResponseDTO {

    private Long campaignId;

    private String title;

    private String description;

    private String location;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer maxVolunteers;

    private CampaignStatus status;

    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long proposedBy;

    private Long approvedBy;

    private Long managedBy;

    private Long category;
}
