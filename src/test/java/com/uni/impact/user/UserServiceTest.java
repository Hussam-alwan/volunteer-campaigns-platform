package com.uni.impact.user;

import com.uni.impact.college.College;
import com.uni.impact.college.CollegeRepository;
import com.uni.impact.util.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock CollegeRepository collegeRepository;
    @Mock UserMapper userMapper;
    @Mock PasswordEncoder passwordEncoder;

    @InjectMocks UserService service;

    private User existing;
    private College college;

    @BeforeEach
    void setup() {
        college = new College();
        college.setCollegeId(7L);

        existing = new User();
        existing.setUserId(1L);
        existing.setEmail("a@b.com");
        existing.setIsBanned(false);
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        void returnsEntity() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            assertThat(service.findById(1L)).isSameAs(existing);
        }

        @Test
        void notFoundThrows() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findById(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("findByEmail")
    class FindByEmail {

        @Test
        void lookupIsCaseInsensitive() {
            when(userRepository.findByEmailIgnoreCase("A@B.com")).thenReturn(Optional.of(existing));
            assertThat(service.findByEmail("A@B.com")).isSameAs(existing);
        }

        @Test
        void missingThrows() {
            when(userRepository.findByEmailIgnoreCase("a@b.com")).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.findByEmail("a@b.com"))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        void rejectsNullPassword() {
            UserRequestDTO dto = baseDto();
            dto.setPassword(null);

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Password is required");
            verifyNoInteractions(userMapper, passwordEncoder);
            verify(userRepository, never()).save(any());
        }

        @Test
        void rejectsBlankPassword() {
            UserRequestDTO dto = baseDto();
            dto.setPassword("   ");

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Password is required");
        }

        @Test
        void rejectsDuplicateEmail() {
            UserRequestDTO dto = baseDto();
            when(userRepository.existsByEmailIgnoreCase("a@b.com")).thenReturn(true);

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Email already exists");

            verify(userRepository, never()).save(any());
        }

        @Test
        void encodesPasswordAndResolvesCollege() {
            UserRequestDTO dto = baseDto();
            User mapped = new User();
            when(userRepository.existsByEmailIgnoreCase("a@b.com")).thenReturn(false);
            when(userMapper.toEntity(dto)).thenReturn(mapped);
            when(passwordEncoder.encode("password!")).thenReturn("HASHED");
            when(collegeRepository.findById(7L)).thenReturn(Optional.of(college));
            when(userRepository.save(mapped)).thenReturn(mapped);

            User result = service.create(dto);

            assertThat(result).isSameAs(mapped);
            assertThat(mapped.getPassword()).isEqualTo("HASHED");
            assertThat(mapped.getCollege()).isSameAs(college);
        }

        @Test
        void missingCollegeThrows() {
            UserRequestDTO dto = baseDto();
            User mapped = new User();
            when(userRepository.existsByEmailIgnoreCase("a@b.com")).thenReturn(false);
            when(userMapper.toEntity(dto)).thenReturn(mapped);
            when(passwordEncoder.encode("password!")).thenReturn("HASHED");
            when(collegeRepository.findById(7L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.create(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("college");
        }
    }

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        void encodesNewPasswordWhenProvided() {
            UserRequestDTO dto = baseDto();
            dto.setPassword("new-password");
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(collegeRepository.findById(7L)).thenReturn(Optional.of(college));
            when(passwordEncoder.encode("new-password")).thenReturn("NEWHASH");
            when(userRepository.save(existing)).thenReturn(existing);

            service.update(1L, dto);

            verify(userMapper).updateEntity(existing, dto);
            assertThat(existing.getPassword()).isEqualTo("NEWHASH");
            assertThat(existing.getCollege()).isSameAs(college);
        }

        @Test
        void leavesPasswordAloneWhenBlank() {
            UserRequestDTO dto = baseDto();
            dto.setPassword("   ");
            existing.setPassword("OLDHASH");
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(collegeRepository.findById(7L)).thenReturn(Optional.of(college));
            when(userRepository.save(existing)).thenReturn(existing);

            service.update(1L, dto);

            assertThat(existing.getPassword()).isEqualTo("OLDHASH");
            verifyNoInteractions(passwordEncoder);
        }

        @Test
        void leavesPasswordAloneWhenNull() {
            UserRequestDTO dto = baseDto();
            dto.setPassword(null);
            existing.setPassword("OLDHASH");
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(collegeRepository.findById(7L)).thenReturn(Optional.of(college));
            when(userRepository.save(existing)).thenReturn(existing);

            service.update(1L, dto);

            assertThat(existing.getPassword()).isEqualTo("OLDHASH");
            verifyNoInteractions(passwordEncoder);
        }

        @Test
        void notFoundThrows() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.update(1L, baseDto()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        void removesWhenPresent() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            service.delete(1L);
            verify(userRepository).delete(existing);
        }

        @Test
        void notFoundThrows() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.delete(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("ban")
    class Ban {

        @Test
        void banSetsFlagAndSaves() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(userRepository.save(existing)).thenReturn(existing);

            User result = service.ban(1L);

            assertThat(result.getIsBanned()).isTrue();
            verify(userRepository).save(existing);
        }

        @Test
        void banIsIdempotentWhenAlreadyBanned() {
            existing.setIsBanned(true);
            when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

            User result = service.ban(1L);

            assertThat(result.getIsBanned()).isTrue();
            verify(userRepository, never()).save(any());
        }

        @Test
        void notFoundThrows() {
            when(userRepository.findById(1L)).thenReturn(Optional.empty());
            assertThatThrownBy(() -> service.ban(1L))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("emailExists")
    class EmailExists {

        @Test
        void delegatesCaseInsensitivelyToRepository() {
            when(userRepository.existsByEmailIgnoreCase("X@y.com")).thenReturn(true);
            assertThat(service.emailExists("X@y.com")).isTrue();
        }
    }

    private UserRequestDTO baseDto() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setFirstName("Ada");
        dto.setLastName("Lovelace");
        dto.setEmail("a@b.com");
        dto.setPassword("password!");
        dto.setIsBanned(false);
        dto.setCollege(7L);
        return dto;
    }
}
