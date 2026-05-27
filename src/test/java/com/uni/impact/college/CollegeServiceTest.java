package com.uni.impact.college;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CollegeService")
class CollegeServiceTest {

    @Mock CollegeRepository collegeRepository;
    @Mock CollegeMapper collegeMapper;
    @Mock UserRepository userRepository;

    @InjectMocks CollegeService service;

    private College existing;

    @BeforeEach
    void setup() {
        existing = new College();
        existing.setCollegeId(1L);
        existing.setName("Engineering");
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntity() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.of(existing));
            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("search")
    class Search {

        @Test
        void blankQueryFallsBackToFindAll() {
            Pageable pageable = Pageable.ofSize(10);
            Page<College> page = new PageImpl<>(List.of(existing));
            when(collegeRepository.findAll(pageable)).thenReturn(page);

            Page<College> result = service.search("   ", pageable);

            assertThat(result).isSameAs(page);
            verify(collegeRepository, never())
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(any(), any(), any());
        }

        @Test
        void nullQueryFallsBackToFindAll() {
            Pageable pageable = Pageable.ofSize(10);
            Page<College> page = new PageImpl<>(List.of(existing));
            when(collegeRepository.findAll(pageable)).thenReturn(page);

            Page<College> result = service.search(null, pageable);

            assertThat(result).isSameAs(page);
        }

        @Test
        void nonBlankQueryUsesContainingQuery() {
            Pageable pageable = Pageable.ofSize(10);
            Page<College> page = new PageImpl<>(List.of(existing));
            when(collegeRepository
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(eq("eng"), eq("eng"), eq(pageable)))
                    .thenReturn(page);

            Page<College> result = service.search("eng", pageable);

            assertThat(result).isSameAs(page);
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void mapsAndSaves() {
            CollegeRequestDTO dto = new CollegeRequestDTO();
            dto.setName("New College");
            College mapped = new College();
            when(collegeMapper.toEntity(dto)).thenReturn(mapped);
            when(collegeRepository.save(mapped)).thenReturn(mapped);

            assertThat(service.create(dto)).isSameAs(mapped);
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        void appliesMapperAndPersists() {
            CollegeRequestDTO dto = new CollegeRequestDTO();
            dto.setName("Renamed");
            when(collegeRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(collegeRepository.save(existing)).thenReturn(existing);

            College result = service.update(1L, dto);

            verify(collegeMapper).updateEntity(existing, dto);
            assertThat(result).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.update(1L, new CollegeRequestDTO()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void deletesWhenNotReferenced() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.existsByCollege_CollegeId(1L)).thenReturn(false);

            service.delete(1L);

            verify(collegeRepository).delete(existing);
        }

        @Test
        void refusesDeleteWhenReferencedByUsers() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.existsByCollege_CollegeId(1L)).thenReturn(true);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("referenced by one or more users");

            verify(collegeRepository, never()).delete(any());
        }

        @Test
        void notFoundThrowsAndDoesNotCheckReferences() {
            when(collegeRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);

            verifyNoInteractions(userRepository);
        }
    }
}
