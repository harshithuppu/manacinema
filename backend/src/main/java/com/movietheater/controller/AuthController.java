package com.movietheater.controller;

import com.movietheater.model.Role;
import com.movietheater.model.User;
import com.movietheater.payload.*;
import com.movietheater.repository.RoleRepository;
import com.movietheater.repository.UserRepository;
import com.movietheater.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);

        User userDetails = (User) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
            .map(item -> item.getAuthority())
            .collect(Collectors.toList());

        return ResponseEntity.ok(JwtResponse.builder()
            .token(jwt)
            .refreshToken(refreshToken)
            .id(userDetails.getId())
            .username(userDetails.getUsername())
            .email(userDetails.getEmail())
            .firstName(userDetails.getFirstName())
            .lastName(userDetails.getLastName())
            .roles(roles)
            .build()
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!", false));
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!", false));
        }

        User user = User.builder()
            .username(signupRequest.getUsername())
            .email(signupRequest.getEmail())
            .password(encoder.encode(signupRequest.getPassword()))
            .firstName(signupRequest.getFirstName())
            .lastName(signupRequest.getLastName())
            .phoneNumber(signupRequest.getPhoneNumber())
            .build();

        Set<String> strRoles = signupRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role customerRole = roleRepository.findByName(Role.ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Role not found"));
            roles.add(customerRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin" -> {
                        Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Role not found"));
                        roles.add(adminRole);
                    }
                    case "theater_owner", "owner" -> {
                        Role ownerRole = roleRepository.findByName(Role.ERole.ROLE_THEATER_OWNER)
                            .orElseThrow(() -> new RuntimeException("Role not found"));
                        roles.add(ownerRole);
                    }
                    default -> {
                        Role customerRole = roleRepository.findByName(Role.ERole.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("Role not found"));
                        roles.add(customerRole);
                    }
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestParam String refreshToken) {
        if (jwtUtils.validateJwtToken(refreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
            String newToken = jwtUtils.generateTokenFromUsername(username);
            return ResponseEntity.ok(Map.of("token", newToken, "type", "Bearer"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid refresh token", false));
    }
}
