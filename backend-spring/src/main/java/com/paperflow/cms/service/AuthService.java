package com.paperflow.cms.service;

import com.paperflow.cms.domain.User;
import com.paperflow.cms.domain.UserRole;
import com.paperflow.cms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(String email,
                             String password,
                             String fullName,
                             String affiliation,
                             String country) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setAffiliation(affiliation);
        user.setCountry(country);

        // Simple heuristic for demo roles based on email
        if (email.startsWith("chair")) {
            user.setRoles(Set.of(UserRole.CHAIR));
        } else if (email.startsWith("reviewer")) {
            user.setRoles(Set.of(UserRole.REVIEWER));
        } else {
            user.setRoles(Set.of(UserRole.AUTHOR));
        }

        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .filter(u -> u.getPassword().equals(password))
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    System.out.println("DEBUG FULL NAME = " + user.getFullName()); // 👈 add this

    return user;

    }

    //


    public String generateAccessToken(User user) {
        // Mock token for prototype
        return "mock-jwt-" + user.getId() + "-" + UUID.randomUUID();
    }

    public String generateRefreshToken(User user) {
        return "mock-rt-" + user.getId() + "-" + UUID.randomUUID();
    }

        public User updateProfile(String userId, String fullName, String affiliation, String country) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (fullName != null) user.setFullName(fullName);
        if (affiliation != null) user.setAffiliation(affiliation);
        if (country != null) user.setCountry(country);

        return userRepository.save(user);
    }

}

