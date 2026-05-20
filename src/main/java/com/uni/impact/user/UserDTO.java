package com.uni.impact.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;


@Getter
@Setter
public class UserDTO {

    private Long userId;

    @Size(max = 50)
    private String studentNumber;

    @NotNull
    @Size(max = 100)
    private String firstName;

    @NotNull
    @Size(max = 100)
    private String lastName;

    @NotNull
    @Size(max = 255)
    @Email
    private String email;

    @Size(max = 10,min = 10)
    private String phone;

    private Integer academicYear;


    @NotNull
    @JsonProperty("isBanned")
    private Boolean isBanned;

    @NotNull
    private OffsetDateTime createdAt;

    @NotNull
    private OffsetDateTime updatedAt;

    @NotNull
    private Long college;

}
