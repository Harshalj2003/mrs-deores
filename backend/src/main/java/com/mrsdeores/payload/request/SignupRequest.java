package com.mrsdeores.payload.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    // SECURITY: "role" field REMOVED — role is always assigned server-side as
    // ROLE_USER
    // This prevents any user from self-assigning ROLE_ADMIN via request body.

    @Size(max = 20)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
}
