package com.uni.impact.progress;

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
@DisplayName("ProgressService")
class ProgressServiceTest {

    @Mock ProgressRepository progressRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock UserRepository userRepository;
    @Mock ProgressMapper progressMapper;

    @InjectMocks ProgressService service;

    private Progress existing;
    private Campaign campaign;
    private User updatedBy;

    @BeforeEach
    void setup() {
        campaign = new Campaign();
        campaign.setCampaignId(50L);
        updatedBy = new User();
        updatedBy.setUserId(60L);

        existing = new Progress();
        existing.setProgressId(1L);
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntity() {
            when(progressRepository.findById(1L)).thenReturn(Optional.of(existing));
            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(progressRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void resolvesRelationsAndPersists() {
            ProgressRequestDTO dto = baseDto();
            Progress mapped = new Progress();
            when(progressMapper.toEntity(dto)).thenReturn(mapped);
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(userRepository.findById(60L)).thenReturn(Optional.of(updatedBy));
            when(progressRepository.save(mapped)).thenReturn(mapped);

            Progress result = service.create(dto);

            assertThat(result).isSameAs(mapped);
            assertThat(mapped.getCampaign()).isSameAs(campaign);
            assertThat(mapped.getUpdatedBy()).isSameAs(updatedBy);
        }

        @Test
        void missingCampaignThrows() {
            ProgressRequestDTO dto = baseDto();
            when(progressMapper.toEntity(dto)).thenReturn(new Progress());
            when(campaignRepository.findById(50L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("campaign");
            verify(progressRepository, never()).save(any());
        }

        @Test
        void missingUpdatedByThrows() {
            ProgressRequestDTO dto = baseDto();
            when(progressMapper.toEntity(dto)).thenReturn(new Progress());
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(userRepository.findById(60L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("updatedBy");
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        void appliesMapperAndRelations() {
            ProgressRequestDTO dto = baseDto();
            when(progressRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(userRepository.findById(60L)).thenReturn(Optional.of(updatedBy));
            when(progressRepository.save(existing)).thenReturn(existing);

            Progress result = service.update(1L, dto);

            verify(progressMapper).updateEntity(existing, dto);
            assertThat(result).isSameAs(existing);
            assertThat(existing.getCampaign()).isSameAs(campaign);
            assertThat(existing.getUpdatedBy()).isSameAs(updatedBy);
        }

        @Test
        void notFoundThrows() {
            when(progressRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.update(1L, baseDto()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void removesWhenPresent() {
            when(progressRepository.findById(1L)).thenReturn(Optional.of(existing));
            service.delete(1L);
            verify(progressRepository).delete(existing);
        }

        @Test
        void notFoundThrows() {
            when(progressRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void wrapsRepositoryFailureAsIllegalState() {
            when(progressRepository.findById(1L)).thenReturn(Optional.of(existing));
            doThrow(new RuntimeException("FK")).when(progressRepository).delete(existing);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Unable to delete progress");
        }
    }

    private ProgressRequestDTO baseDto() {
        ProgressRequestDTO dto = new ProgressRequestDTO();
        dto.setPercentage(50);
        dto.setCampaign(50L);
        dto.setUpdatedBy(60L);
        return dto;
    }
}
