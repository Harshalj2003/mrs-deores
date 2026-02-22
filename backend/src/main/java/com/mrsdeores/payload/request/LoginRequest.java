package com.mrsdeores.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @com.fasterxml.jackson.annotation.JsonProperty("isAdmin")
    private boolean isAdmin = false;

    private String inviteToken;
}
