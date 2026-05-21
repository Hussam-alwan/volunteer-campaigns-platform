package com.uni.impact.application;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import com.uni.impact.application.dto.VolunteerSearchCriteria;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationMapper applicationMapper;

    public Page<Application> findByCampaign(final Long campaignId, Pageable pageable) {
        return applicationRepository.findByCampaignCampaignId(campaignId, pageable);
    }

    public Page<Application> findByStudent(final Long studentId, Pageable pageable) {
        return applicationRepository.findByStudentUserId(studentId, pageable);
    }

    public Page<Application> findByStudentEmail(final String email, Pageable pageable) {
        final User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(NotFoundException::new);
        return findByStudent(user.getUserId(), pageable);
    }

    public Page<Application> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }


    public Page<Application> searchVolunteers(VolunteerSearchCriteria criteria, Pageable pageable) {
        Specification<Application> spec = VolunteerSpecification.withSearchCriteria(criteria);
        return applicationRepository.findAll(spec, pageable);
    }

    public Application findById(final Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Application create(final ApplicationDTO applicationDTO) {
        if (applicationDTO.getId() != null) {
            throw new IllegalArgumentException("A new application cannot already have an ID");
        }

        Application application = applicationMapper.toEntity(applicationDTO);
        applyRelations(application, applicationDTO);

        return applicationRepository.save(application);
    }

    @Transactional
    public Application update(final Long id, final ApplicationDTO applicationDTO) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        applicationMapper.updateEntity(application, applicationDTO);
        applyRelations(application, applicationDTO);

        return applicationRepository.save(application);
    }

    @Transactional
    public void delete(final Long id) {
        final Application application = applicationRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        try {
            applicationRepository.delete(application);
        } catch (Exception e) {
            throw new RuntimeException("Cannot delete application as it is being referenced by another entity");
        }
    }

    private void applyRelations(final Application application, final ApplicationDTO applicationDTO) {
        User student = applicationDTO.getStudent() == null ? null : userRepository.findById(applicationDTO.getStudent())
                .orElseThrow(() -> new NotFoundException("student not found"));
        application.setStudent(student);

        final Campaign campaign = applicationDTO.getCampaign() == null ? null : campaignRepository.findById(applicationDTO.getCampaign())
                .orElseThrow(() -> new NotFoundException("campaign not found"));
        application.setCampaign(campaign);

        final User reviewedBy = applicationDTO.getReviewedBy() == null ? null : userRepository.findById(applicationDTO.getReviewedBy())
                .orElseThrow(() -> new NotFoundException("reviewedBy not found"));
        application.setReviewedBy(reviewedBy);

        final User removedBy = applicationDTO.getRemovedBy() == null ? null : userRepository.findById(applicationDTO.getRemovedBy())
                .orElseThrow(() -> new NotFoundException("removedBy not found"));
        application.setRemovedBy(removedBy);
    }

    @Transactional
    public void applyToCampaign(final Long campaignId, final String studentEmail, final ApplicationDTO applicationDTO) {
        final User student = studentEmail == null ? null : userRepository.findByEmailIgnoreCase(studentEmail).orElseThrow(NotFoundException::new);
        final Campaign campaign = campaignRepository.findById(campaignId).orElseThrow(() -> new NotFoundException("campaign not found"));
        Application application = new Application();
        application.setCampaign(campaign);
        application.setStudent(student);
        application.setStatus(ApplicationStatus.PENDING);
        application.setAppliedAt(java.time.LocalDateTime.now());
        application.setMotivationLetter(applicationDTO == null ? null : applicationDTO.getMotivationLetter());
        applicationRepository.save(application);
    }

    @Transactional
    public void changeStatus(final Long id, final ApplicationStatus newStatus, final Long reviewerId, final String rejectionReason) {
        Application application = applicationRepository.findById(id).orElseThrow(NotFoundException::new);
        // simple transition rules
        ApplicationStatus current = application.getStatus();
        boolean allowed = false;
        if (current == ApplicationStatus.PENDING) {
            allowed = newStatus == ApplicationStatus.APPROVED || newStatus == ApplicationStatus.REJECTED || newStatus == ApplicationStatus.CANCELLED;
        } else if (current == ApplicationStatus.APPROVED) {
            allowed = newStatus == ApplicationStatus.CANCELLED;
        }
        if (!allowed) {
            throw new IllegalArgumentException("Invalid status transition from " + current + " to " + newStatus);
        }
        application.setStatus(newStatus);
        application.setReviewedAt(java.time.LocalDateTime.now());
        if (reviewerId != null) {
            application.setReviewedBy(userRepository.findById(reviewerId).orElseThrow(NotFoundException::new));
        }
        if (newStatus == ApplicationStatus.REJECTED && rejectionReason != null) {
            application.setRejectionReason(rejectionReason);
        }
        applicationRepository.save(application);
    }

    @Transactional
    public void withdraw(final Long id, final Long studentId) {
        Application application = applicationRepository.findById(id).orElseThrow(NotFoundException::new);
        if (!application.getStudent().getUserId().equals(studentId)) {
            throw new IllegalArgumentException("Only the student can withdraw their application");
        }
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setWithdrawnAt(java.time.LocalDateTime.now());
        applicationRepository.save(application);
    }

    @Transactional
    public void remove(final Long id, final Long removedById, final String removalReason) {
        Application application = applicationRepository.findById(id).orElseThrow(NotFoundException::new);
        application.setRemovedAt(java.time.LocalDateTime.now());
        application.setRemovalReason(removalReason);
        if (removedById != null) {
            application.setRemovedBy(userRepository.findById(removedById).orElseThrow(NotFoundException::new));
        }
        // mark canceled when removed
        application.setStatus(ApplicationStatus.CANCELLED);
        applicationRepository.save(application);
    }
}
