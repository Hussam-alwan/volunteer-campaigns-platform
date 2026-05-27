package com.uni.impact.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Getter
@Setter
public class UserResponseDTO {

    private Long userId;

    private String studentNumber;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private Integer academicYear;

    @JsonProperty("isBanned")
    private Boolean isBanned;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long college;

}
