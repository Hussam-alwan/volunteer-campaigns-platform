package com.uni.impact.application;


import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationMapper applicationMapper;

    public Page<Application> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable);
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
}
