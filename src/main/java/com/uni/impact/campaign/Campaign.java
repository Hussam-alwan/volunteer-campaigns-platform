package com.uni.impact.campaign;

import com.uni.impact.application.Application;
import com.uni.impact.attendance.Attendance;
import com.uni.impact.campaign_photo.CampaignPhoto;
import com.uni.impact.category.Category;
import com.uni.impact.progress.Progress;
import com.uni.impact.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class Campaign {

    @Id
    @Column(updatable = false)
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long campaignId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column
    private String location;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column
    private Integer maxVolunteers;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private CampaignStatus status;

    @Column
    private OffsetDateTime publishedAt;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    @LastModifiedDate
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposed_by_id", nullable = false)
    private User proposedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "managed_by_id")
    private User managedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "campaign")
    private Set<CampaignPhoto> campaignCampaignPhotos = new HashSet<>();

    @OneToMany(mappedBy = "campaign")
    private Set<Progress> campaignProgresses = new HashSet<>();

    @OneToMany(mappedBy = "campaign")
    private Set<Application> campaignApplications = new HashSet<>();

    @OneToMany(mappedBy = "campaign")
    private Set<Attendance> campaignAttendances = new HashSet<>();

}
