package com.uni.impact.progress;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign_photo.CampaignPhoto;
import com.uni.impact.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Progress {

    @Id
    @Column(nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long progressId;

    @Column(nullable = false)
    private Integer percentage;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id", nullable = false)
    private User updatedBy;

    @OneToMany(mappedBy = "progress")
    private List<CampaignPhoto> progressCampaignPhotos = new ArrayList<>();

}
