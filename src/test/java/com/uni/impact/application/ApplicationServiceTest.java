package com.uni.impact.application;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.user.User;
import com.uni.impact.user.UserRepository;
import com.uni.impact.util.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ApplicationService")
class ApplicationServiceTest {

    @Mock ApplicationRepository applicationRepository;
    @Mock UserRepository userRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock ApplicationMapper applicationMapper;

    @InjectMocks ApplicationService service;

    private Application existing;
    private User student;

    @BeforeEach
    void setup() {
        student = new User();
        student.setUserId(42L);
        student.setEmail("s@x.com");

        existing = new Application();
        existing.setId(1L);
        existing.setStudent(student);
        existing.setStatus(ApplicationStatus.PENDING);
    }

    @Nested
    @DisplayName("changeStatus state machine")
    class ChangeStatus {

        @Test
        void pendingToApprovedRecordsReviewer() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));
            User reviewer = new User();
            reviewer.setUserId(99L);
            when(userRepository.findById(99L)).thenReturn(Optional.of(reviewer));

            service.changeStatus(1L, ApplicationStatus.APPROVED, 99L, null);

            assertThat(existing.getStatus()).isEqualTo(ApplicationStatus.APPROVED);
            assertThat(existing.getReviewedAt()).isNotNull();
            assertThat(existing.getReviewedBy()).isSameAs(reviewer);
            verify(applicationRepository).save(existing);
        }

        @Test
        void pendingToRejectedSetsRejectionReason() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.changeStatus(1L, ApplicationStatus.REJECTED, null, "spam");

            assertThat(existing.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
            assertThat(existing.getRejectionReason()).isEqualTo("spam");
        }

        @Test
        void pendingToCancelledOk() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.changeStatus(1L, ApplicationStatus.CANCELLED, null, null);

            assertThat(existing.getStatus()).isEqualTo(ApplicationStatus.CANCELLED);
        }

        @Test
        void pendingToWithdrawnIsRejected() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> service.changeStatus(1L, ApplicationStatus.WITHDRAWN, null, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid status transition");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        void approvedToCancelledOk() {
            existing.setStatus(ApplicationStatus.APPROVED);
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.changeStatus(1L, ApplicationStatus.CANCELLED, null, null);

            assertThat(existing.getStatus()).isEqualTo(ApplicationStatus.CANCELLED);
        }

        @Test
        void approvedCannotMoveBackToRejected() {
            existing.setStatus(ApplicationStatus.APPROVED);
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> service.changeStatus(1L, ApplicationStatus.REJECTED, null, null))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(applicationRepository, never()).save(any());
        }

        @Test
        void rejectedIsTerminal() {
            existing.setStatus(ApplicationStatus.REJECTED);
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> service.changeStatus(1L, ApplicationStatus.APPROVED, null, null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void withdrawnIsTerminal() {
            existing.setStatus(ApplicationStatus.WITHDRAWN);
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> service.changeStatus(1L, ApplicationStatus.PENDING, null, null))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void notFoundThrows() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.changeStatus(1L, ApplicationStatus.APPROVED, null, null))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void rejectionReasonIsIgnoredWhenStatusIsNotRejected() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.changeStatus(1L, ApplicationStatus.APPROVED, null, "not used");

            assertThat(existing.getRejectionReason()).isNull();
        }
    }

    @Nested
    @DisplayName("withdraw")
    class Withdraw {

        @Test
        void studentCanWithdrawOwnApplication() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.withdraw(1L, 42L);

            assertThat(existing.getStatus()).isEqualTo(ApplicationStatus.WITHDRAWN);
            assertThat(existing.getWithdrawnAt()).isNotNull();
            verify(applicationRepository).save(existing);
        }

        @Test
        void differentStudentCannotWithdraw() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThatThrownBy(() -> service.withdraw(1L, 999L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Only the student");

            verify(applicationRepository, never()).save(any());
        }

        @Test
        void notFoundThrows() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.withdraw(1L, 42L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("applyToCampaign")
    class ApplyToCampaign {

        @Test
        void savesPendingApplicationForStudent() {
            Campaign campaign = new Campaign();
            campaign.setCampaignId(7L);

            when(userRepository.findByEmailIgnoreCase("s@x.com")).thenReturn(Optional.of(student));
            when(campaignRepository.findById(7L)).thenReturn(Optional.of(campaign));

            ApplicationRequestDTO dto = new ApplicationRequestDTO();
            dto.setMotivationLetter("hello");

            service.applyToCampaign(7L, "s@x.com", dto);

            ArgumentCaptor<Application> captor = ArgumentCaptor.forClass(Application.class);
            verify(applicationRepository).save(captor.capture());
            Application saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo(ApplicationStatus.PENDING);
            assertThat(saved.getStudent()).isSameAs(student);
            assertThat(saved.getCampaign()).isSameAs(campaign);
            assertThat(saved.getMotivationLetter()).isEqualTo("hello");
            assertThat(saved.getAppliedAt()).isNotNull();
        }

        @Test
        void unknownCampaignThrows() {
            when(userRepository.findByEmailIgnoreCase("s@x.com")).thenReturn(Optional.of(student));
            when(campaignRepository.findById(7L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.applyToCampaign(7L, "s@x.com", null))
                    .isInstanceOf(NotFoundException.class);
            verify(applicationRepository, never()).save(any());
        }

        @Test
        void unknownStudentEmailThrows() {
            when(userRepository.findByEmailIgnoreCase("nope@x.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.applyToCampaign(7L, "nope@x.com", null))
                    .isInstanceOf(NotFoundException.class);
            verify(applicationRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void wrapsRepositoryFailureAsIllegalState() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.of(existing));
            doThrow(new RuntimeException("FK")).when(applicationRepository).delete(existing);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Cannot delete application");
        }

        @Test
        void notFoundThrows() {
            when(applicationRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}
