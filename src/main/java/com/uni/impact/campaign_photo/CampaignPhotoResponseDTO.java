package com.uni.impact.campaign_photo;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class CampaignPhotoResponseDTO {

    private Long photoId;

    private String photoUrl;

    private LocalDateTime uploadedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long campaign;

    private Long progress;

}
