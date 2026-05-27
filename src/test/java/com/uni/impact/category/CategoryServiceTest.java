package com.uni.impact.category;

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
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService")
class CategoryServiceTest {

    @Mock CategoryRepository categoryRepository;
    @Mock CategoryMapper categoryMapper;

    @InjectMocks CategoryService service;

    private Category existing;

    @BeforeEach
    void setup() {
        existing = new Category();
        existing.setCategoryId(1L);
        existing.setName("Education");
    }

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        void delegatesToRepository() {
            Pageable pageable = Pageable.ofSize(10);
            Page<Category> page = new PageImpl<>(List.of(existing));
            when(categoryRepository.findAll(pageable)).thenReturn(page);

            Page<Category> result = service.findAll(pageable);

            assertThat(result).isSameAs(page);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntityWhenPresent() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));

            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void mapsDtoAndSaves() {
            CategoryRequestDTO dto = new CategoryRequestDTO();
            dto.setName("Health");
            Category mapped = new Category();
            mapped.setName("Health");

            when(categoryMapper.toEntity(dto)).thenReturn(mapped);
            when(categoryRepository.save(mapped)).thenReturn(mapped);

            Category result = service.create(dto);

            assertThat(result).isSameAs(mapped);
            verify(categoryRepository).save(mapped);
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        void appliesMapperAndPersists() {
            CategoryRequestDTO dto = new CategoryRequestDTO();
            dto.setName("Renamed");
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(categoryRepository.save(existing)).thenReturn(existing);

            Category result = service.update(1L, dto);

            verify(categoryMapper).updateEntity(existing, dto);
            verify(categoryRepository).save(existing);
            assertThat(result).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.update(1L, new CategoryRequestDTO()))
                    .isInstanceOf(NotFoundException.class);
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void removesWhenPresent() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));

            service.delete(1L);

            verify(categoryRepository).delete(existing);
        }

        @Test
        void notFoundThrows() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        void wrapsRepositoryFailureAsIllegalState() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(existing));
            doThrow(new RuntimeException("FK violation")).when(categoryRepository).delete(existing);

            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Unable to delete category");
        }
    }
}
