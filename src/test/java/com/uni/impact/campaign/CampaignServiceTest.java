package com.uni.impact.campaign;

import com.uni.impact.application.ApplicationRepository;
import com.uni.impact.attendance.AttendanceRepository;
import com.uni.impact.campaign_photo.CampaignPhotoService;
import com.uni.impact.category.CategoryRepository;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CampaignService")
class CampaignServiceTest {

    @Mock CampaignRepository campaignRepository;
    @Mock UserRepository userRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock CampaignMapper campaignMapper;
    @Mock CampaignPhotoService campaignPhotoService;
    @Mock ApplicationRepository applicationRepository;
    @Mock AttendanceRepository attendanceRepository;
    @Mock ProgressRepository progressRepository;

    @InjectMocks CampaignService service;

    private Campaign campaign;

    @BeforeEach
    void setup() {
        campaign = new Campaign();
        campaign.setCampaignId(1L);
    }

    @ParameterizedTest(name = "{0} -> {1} is allowed")
    @CsvSource({
            "PENDING,APPROVED",
            "PENDING,REJECTED",
            "PENDING,CANCELED",
            "APPROVED,ONGOING",
            "APPROVED,CANCELED",
            "ONGOING,COMPLETED",
            "ONGOING,CANCELED",
            "PENDING,PENDING",
            "APPROVED,APPROVED",
            "ONGOING,ONGOING",
            "REJECTED,REJECTED",
            "COMPLETED,COMPLETED",
            "CANCELED,CANCELED"
    })
    void allowedTransitions(CampaignStatus from, CampaignStatus to) {
        campaign.setStatus(from);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);

        Campaign result = service.updateStatus(1L, to);

        assertThat(result.getStatus()).isEqualTo(to);
        verify(campaignRepository).save(campaign);
    }

    @ParameterizedTest(name = "{0} -> {1} is rejected")
    @CsvSource({
            "PENDING,ONGOING",
            "PENDING,COMPLETED",
            "APPROVED,REJECTED",
            "APPROVED,COMPLETED",
            "APPROVED,PENDING",
            "ONGOING,APPROVED",
            "ONGOING,REJECTED",
            "ONGOING,PENDING",
            "REJECTED,APPROVED",
            "REJECTED,PENDING",
            "COMPLETED,ONGOING",
            "CANCELED,APPROVED"
    })
    void rejectedTransitions(CampaignStatus from, CampaignStatus to) {
        campaign.setStatus(from);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));

        assertThatThrownBy(() -> service.updateStatus(1L, to))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid status transition");
        verify(campaignRepository, never()).save(any());
    }

    @Test
    void updateStatusMissingCampaignThrows() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateStatus(1L, CampaignStatus.APPROVED))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void findByIdMissingThrows() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void deleteCascadesDependentsBeforeCampaign() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));

        service.delete(1L);

        InOrder order = inOrder(
                campaignPhotoService, applicationRepository,
                attendanceRepository, progressRepository, campaignRepository);
        order.verify(campaignPhotoService).deleteByCampaign(1L);
        order.verify(applicationRepository).deleteByCampaignCampaignId(1L);
        order.verify(attendanceRepository).deleteByCampaignCampaignId(1L);
        order.verify(progressRepository).deleteByCampaignCampaignId(1L);
        order.verify(campaignRepository).delete(campaign);
    }

    @Test
    void deleteWrapsUnderlyingFailure() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        doThrow(new RuntimeException("boom")).when(campaignPhotoService).deleteByCampaign(1L);

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("campaign could not be deleted");
    }

    @Test
    void deleteMissingCampaignThrows() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(NotFoundException.class);
    }
}
