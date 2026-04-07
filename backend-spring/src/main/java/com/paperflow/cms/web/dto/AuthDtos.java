package com.paperflow.cms.web.dto;

public class AuthDtos {

    public record RegisterRequest(
            String email,
            String password,
            String fullName,
            String affiliation,
            String country) {
    }

    public record RegisterResponse(
            String userId,
            String status,
            String message) {
    }

    public record LoginRequest(
            String email,
            String password) {
    }

    public record UpdateProfileRequest(
            String fullName,
            String affiliation,
            String country) {
    }

    public record UpdateProfileResponse(
            String userId,
            String status,
            String message) {
    }

    public record LoginResponse(
            String accessToken,
            String refreshToken,
            long expiresIn,
            String userId,
            String email,
            java.util.Set<String> roles,
            String fullName,

            String affiliation,
            String country) {
    }

}
