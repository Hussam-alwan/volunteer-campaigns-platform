package com.uni.impact.auth;

import com.uni.impact.user.User;
import com.uni.impact.user.UserMapper;
import com.uni.impact.user.UserRequestDTO;
import com.uni.impact.user.UserResponseDTO;
import com.uni.impact.user.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController")
class AuthControllerTest {

    @Mock AuthenticationManager authenticationManager;
    @Mock UserService userService;
    @Mock UserMapper userMapper;

    @InjectMocks AuthController controller;

    @BeforeEach
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginAuthenticatesAndPersistsSecurityContext() {
        Authentication auth = new UsernamePasswordAuthenticationToken("a@b.com", "pw");
        when(authenticationManager.authenticate(any())).thenReturn(auth);

        User user = new User();
        user.setEmail("a@b.com");
        when(userService.findByEmail("a@b.com")).thenReturn(user);

        UserResponseDTO dto = new UserResponseDTO();
        dto.setEmail("a@b.com");
        when(userMapper.toDto(user)).thenReturn(dto);

        LoginRequestDTO body = new LoginRequestDTO();
        body.setEmail("a@b.com");
        body.setPassword("pw");

        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();

        ResponseEntity<UserResponseDTO> response = controller.login(body, req, res);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("a@b.com");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isSameAs(auth);
    }

    @Test
    void loginReturns401OnBadCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        LoginRequestDTO body = new LoginRequestDTO();
        body.setEmail("a@b.com");
        body.setPassword("wrong");

        ResponseEntity<UserResponseDTO> response = controller.login(
                body, new MockHttpServletRequest(), new MockHttpServletResponse());

        assertThat(response.getStatusCode().value()).isEqualTo(401);
        assertThat(response.getBody()).isNull();
    }

    @Test
    void meReturns401WhenAuthenticationMissing() {
        ResponseEntity<UserResponseDTO> response = controller.me(null);

        assertThat(response.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void meReturnsUserForAuthenticatedRequest() {
        TestingAuthenticationToken auth = new TestingAuthenticationToken("a@b.com", null, "ROLE_STUDENT");
        auth.setAuthenticated(true);

        User user = new User();
        user.setEmail("a@b.com");
        when(userService.findByEmail("a@b.com")).thenReturn(user);

        UserResponseDTO dto = new UserResponseDTO();
        dto.setEmail("a@b.com");
        when(userMapper.toDto(user)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = controller.me(auth);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("a@b.com");
    }

    @Test
    void logoutInvalidatesSessionAndClearsContext() {
        TestingAuthenticationToken auth = new TestingAuthenticationToken("a@b.com", null, "ROLE_STUDENT");
        auth.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(auth);

        MockHttpServletRequest req = new MockHttpServletRequest();
        req.getSession(true);

        ResponseEntity<Void> response = controller.logout(req);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void logoutWithoutSessionStillReturns204() {
        MockHttpServletRequest req = new MockHttpServletRequest();

        ResponseEntity<Void> response = controller.logout(req);

        assertThat(response.getStatusCode().value()).isEqualTo(204);
    }

    @Test
    void registerCreatesUserAndReturns201() {
        UserRequestDTO req = new UserRequestDTO();
        req.setEmail("a@b.com");

        User created = new User();
        created.setUserId(9L);
        when(userService.create(req)).thenReturn(created);

        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(9L);
        when(userMapper.toDto(created)).thenReturn(dto);

        ResponseEntity<UserResponseDTO> response = controller.register(req);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getUserId()).isEqualTo(9L);
    }
}
