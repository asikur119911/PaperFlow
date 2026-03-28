package com.paperflow.cms.web;

import com.paperflow.cms.domain.User;
import com.paperflow.cms.service.AuthService;
import com.paperflow.cms.web.dto.AuthDtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/paperflow/v1")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<AuthDtos.RegisterResponse> register(
        @RequestBody AuthDtos.RegisterRequest request
    ) {
        User user = authService.registerUser(
            request.email(),
            request.password(),
            request.fullName(),
            request.affiliation(),
            request.country()
        );
        return ResponseEntity.ok(
            new AuthDtos.RegisterResponse(
                user.getId(),
                "PENDING_VERIFICATION",
                "Verification email sent."
            )
        );
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthDtos.LoginResponse> login(
        @RequestBody AuthDtos.LoginRequest request
    ) {
        User user = authService.login(request.email(), request.password());
        String access = authService.generateAccessToken(user);
        String refresh = authService.generateRefreshToken(user);
        return ResponseEntity.ok(
            new AuthDtos.LoginResponse(
                access,
                refresh,
                3600
            )
        );
    }
}

