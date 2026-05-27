package com.uni.impact.campaign_photo;

import com.uni.impact.campaign.Campaign;
import com.uni.impact.campaign.CampaignRepository;
import com.uni.impact.progress.Progress;
import com.uni.impact.progress.ProgressRepository;
import com.uni.impact.util.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CampaignPhotoService")
class CampaignPhotoServiceTest {

    @Mock CampaignPhotoRepository campaignPhotoRepository;
    @Mock CampaignRepository campaignRepository;
    @Mock ProgressRepository progressRepository;
    @Mock CampaignPhotoMapper campaignPhotoMapper;

    @InjectMocks CampaignPhotoService service;

    @TempDir Path tempDir;

    private Campaign campaign;
    private Progress progress;
    private CampaignPhoto existing;

    @BeforeEach
    void setup() {
        campaign = new Campaign();
        campaign.setCampaignId(50L);
        progress = new Progress();
        progress.setProgressId(70L);

        existing = new CampaignPhoto();
        existing.setPhotoId(1L);
        existing.setPhotoUrl("/uploads/photos/old.png");

        // Field injected via @Value normally — set it to the temp dir for file tests.
        ReflectionTestUtils.setField(service, "uploadDir", tempDir.toString());
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntity() {
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.of(existing));
            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create (DTO)")
    class CreateFromDto {

        @Test
        void resolvesCampaignAndProgress() {
            CampaignPhotoRequestDTO dto = baseDto();
            CampaignPhoto mapped = new CampaignPhoto();
            when(campaignPhotoMapper.toEntity(dto)).thenReturn(mapped);
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(progressRepository.findById(70L)).thenReturn(Optional.of(progress));
            when(campaignPhotoRepository.save(mapped)).thenReturn(mapped);

            CampaignPhoto result = service.create(dto);

            assertThat(result).isSameAs(mapped);
            assertThat(mapped.getCampaign()).isSameAs(campaign);
            assertThat(mapped.getProgress()).isSameAs(progress);
        }

        @Test
        void nullProgressIdLeavesProgressNull() {
            CampaignPhotoRequestDTO dto = baseDto();
            dto.setProgress(null);
            CampaignPhoto mapped = new CampaignPhoto();
            when(campaignPhotoMapper.toEntity(dto)).thenReturn(mapped);
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(campaignPhotoRepository.save(mapped)).thenReturn(mapped);

            service.create(dto);

            assertThat(mapped.getProgress()).isNull();
        }

        @Test
        void missingCampaignThrows() {
            CampaignPhotoRequestDTO dto = baseDto();
            when(campaignPhotoMapper.toEntity(dto)).thenReturn(new CampaignPhoto());
            when(campaignRepository.findById(50L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("campaign");
        }
    }

    @Nested
    @DisplayName("createFromFile")
    class CreateFromFile {

        @Test
        void rejectsNullFile() {
            assertThatThrownBy(() -> service.createFromFile(50L, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("File cannot be empty");
        }

        @Test
        void rejectsEmptyFile() {
            MultipartFile empty = new MockMultipartFile("file", "x.png", "image/png", new byte[0]);
            assertThatThrownBy(() -> service.createFromFile(50L, empty))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("File cannot be empty");
        }

        @Test
        void rejectsNonImageContentType() {
            MultipartFile pdf = new MockMultipartFile("file", "evil.pdf", "application/pdf", "abc".getBytes());
            assertThatThrownBy(() -> service.createFromFile(50L, pdf))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Only image files are allowed");
        }

        @Test
        void writesFileAndPersistsPhoto() throws Exception {
            byte[] body = new byte[]{1, 2, 3};
            MultipartFile png = new MockMultipartFile("file", "pic.PNG", "image/png", body);
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(campaignPhotoRepository.save(any(CampaignPhoto.class))).thenAnswer(i -> i.getArgument(0));

            CampaignPhoto result = service.createFromFile(50L, png);

            assertThat(result.getCampaign()).isSameAs(campaign);
            assertThat(result.getPhotoUrl()).startsWith("/uploads/photos/").endsWith(".png");
            assertThat(result.getUploadedAt()).isNotNull();

            String filename = result.getPhotoUrl().substring(result.getPhotoUrl().lastIndexOf('/') + 1);
            Path written = tempDir.resolve(filename);
            assertThat(Files.exists(written)).isTrue();
            assertThat(Files.readAllBytes(written)).containsExactly(1, 2, 3);
        }

        @Test
        void filenameHasNoExtensionWhenOriginalLacksDot() {
            MultipartFile noExt = new MockMultipartFile("file", "noext", "image/png", new byte[]{9});
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(campaignPhotoRepository.save(any(CampaignPhoto.class))).thenAnswer(i -> i.getArgument(0));

            CampaignPhoto result = service.createFromFile(50L, noExt);

            String filename = result.getPhotoUrl().substring(result.getPhotoUrl().lastIndexOf('/') + 1);
            assertThat(filename).doesNotContain(".");
        }

        @Test
        void missingCampaignThrows() {
            MultipartFile png = new MockMultipartFile("file", "pic.png", "image/png", new byte[]{1});
            when(campaignRepository.findById(50L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.createFromFile(50L, png))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createFromFiles")
    class CreateFromFiles {

        @Test
        void rejectsNullArray() {
            assertThatThrownBy(() -> service.createFromFiles(50L, null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("No files provided");
        }

        @Test
        void rejectsEmptyArray() {
            assertThatThrownBy(() -> service.createFromFiles(50L, new MultipartFile[0]))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("No files provided");
        }

        @Test
        void skipsEmptyEntriesAndPersistsRest() {
            MultipartFile good = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});
            MultipartFile empty = new MockMultipartFile("file", "b.jpg", "image/jpeg", new byte[0]);
            MultipartFile good2 = new MockMultipartFile("file", "c.jpg", "image/jpeg", new byte[]{2});
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(campaignPhotoRepository.save(any(CampaignPhoto.class))).thenAnswer(i -> i.getArgument(0));

            List<CampaignPhoto> saved = service.createFromFiles(50L, new MultipartFile[]{good, empty, null, good2});

            assertThat(saved).hasSize(2);
            verify(campaignPhotoRepository, times(2)).save(any(CampaignPhoto.class));
        }

        @Test
        void rejectsBatchWhenAnyFileIsNotImage() {
            MultipartFile good = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});
            MultipartFile bad = new MockMultipartFile("file", "b.txt", "text/plain", new byte[]{2});
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));

            assertThatThrownBy(() -> service.createFromFiles(50L, new MultipartFile[]{good, bad}))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Only image files");
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        void appliesMapperAndRelations() {
            CampaignPhotoRequestDTO dto = baseDto();
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(campaignRepository.findById(50L)).thenReturn(Optional.of(campaign));
            when(progressRepository.findById(70L)).thenReturn(Optional.of(progress));
            when(campaignPhotoRepository.save(existing)).thenReturn(existing);

            CampaignPhoto result = service.update(1L, dto);

            assertThat(result).isSameAs(existing);
            verify(campaignPhotoMapper).updateEntity(existing, dto);
            assertThat(existing.getCampaign()).isSameAs(campaign);
            assertThat(existing.getProgress()).isSameAs(progress);
        }

        @Test
        void notFoundThrows() {
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.update(1L, baseDto()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void deletesRowAndFileOnDisk() throws Exception {
            Path file = tempDir.resolve("to-delete.png");
            Files.writeString(file, "data");
            existing.setPhotoUrl("/uploads/photos/to-delete.png");
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.delete(1L);

            assertThat(Files.exists(file)).isFalse();
            verify(campaignPhotoRepository).delete(existing);
        }

        @Test
        void missingFileOnDiskDoesNotBlockDelete() {
            existing.setPhotoUrl("/uploads/photos/never-existed.png");
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.delete(1L);

            verify(campaignPhotoRepository).delete(existing);
        }

        @Test
        void wrapsRepositoryFailureAsIllegalState() {
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.of(existing));
            doThrow(new RuntimeException("boom")).when(campaignPhotoRepository).delete(existing);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Unable to delete campaign photo");
        }

        @Test
        void notFoundThrows() {
            when(campaignPhotoRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteByCampaign")
    class DeleteByCampaign {

        @Test
        void removesFilesAndRowsForAllPhotosOfCampaign() throws Exception {
            Path a = tempDir.resolve("a.png");
            Path b = tempDir.resolve("b.png");
            Files.writeString(a, "1");
            Files.writeString(b, "2");
            CampaignPhoto p1 = new CampaignPhoto();
            p1.setPhotoUrl("/uploads/photos/a.png");
            CampaignPhoto p2 = new CampaignPhoto();
            p2.setPhotoUrl("/uploads/photos/b.png");
            List<CampaignPhoto> photos = List.of(p1, p2);
            when(campaignPhotoRepository.findAllByCampaignCampaignId(50L)).thenReturn(photos);

            service.deleteByCampaign(50L);

            assertThat(Files.exists(a)).isFalse();
            assertThat(Files.exists(b)).isFalse();
            verify(campaignPhotoRepository).deleteAll(photos);
        }

        @Test
        void noopWhenCampaignHasNoPhotos() {
            when(campaignPhotoRepository.findAllByCampaignCampaignId(50L)).thenReturn(List.of());

            service.deleteByCampaign(50L);

            ArgumentCaptor<List<CampaignPhoto>> captor = ArgumentCaptor.forClass(List.class);
            verify(campaignPhotoRepository).deleteAll(captor.capture());
            assertThat(captor.getValue()).isEmpty();
            verify(campaignPhotoRepository, never()).delete(any());
        }
    }

    private CampaignPhotoRequestDTO baseDto() {
        CampaignPhotoRequestDTO dto = new CampaignPhotoRequestDTO();
        dto.setPhotoUrl("/uploads/photos/new.png");
        dto.setUploadedAt(LocalDateTime.now());
        dto.setCampaign(50L);
        dto.setProgress(70L);
        return dto;
    }
}
