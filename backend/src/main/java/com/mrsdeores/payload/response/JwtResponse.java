package com.mrsdeores.payload.response;

import java.util.List;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    @com.fasterxml.jackson.annotation.JsonProperty("isEmailVerified")
    private boolean isEmailVerified;

    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles,
            boolean isEmailVerified) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.isEmailVerified = isEmailVerified;
    }
}
