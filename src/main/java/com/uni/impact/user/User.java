package com.uni.impact.user;

import com.uni.impact.application.Application;
import com.uni.impact.attendance.Attendance;
import com.uni.impact.campaign.Campaign;
import com.uni.impact.college.College;
import com.uni.impact.progress.Progress;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "\"user\"")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class User {

    @Id
    @Column(updatable = false)
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long userId;

    @Column(length = 50)
    private String studentNumber;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column
    private Integer academicYear;


    @Column(nullable = false)
    private Boolean isBanned;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    @LastModifiedDate
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @OneToMany(mappedBy = "proposedBy")
    private List<Campaign> proposedByCampaigns = new ArrayList<>();

    @OneToMany(mappedBy = "approvedBy")
    private List<Campaign> approvedByCampaigns = new ArrayList<>();

    @OneToMany(mappedBy = "managedBy")
    private List<Campaign> managedByCampaigns = new ArrayList<>();

    @OneToMany(mappedBy = "updatedBy")
    private List<Progress> updatedByProgresses = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    private List<Application> studentApplications = new ArrayList<>();

    @OneToMany(mappedBy = "reviewedBy")
    private List<Application> reviewedByApplications = new ArrayList<>();

    @OneToMany(mappedBy = "removedBy")
    private List<Application> removedByApplications = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    private List<Attendance> studentAttendances = new ArrayList<>();

    @OneToMany(mappedBy = "recordedBy")
    private List<Attendance> recordedByAttendances = new ArrayList<>();

}
