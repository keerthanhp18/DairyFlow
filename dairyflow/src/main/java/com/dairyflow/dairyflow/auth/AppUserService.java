
package com.dairyflow.dairyflow.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser registerFarmer(
            String name, String phone, String password) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (phone == null || !phone.trim().matches("[0-9]{10}")) {
            throw new IllegalArgumentException(
                    "Enter a valid 10-digit mobile number");
        }

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        phone = phone.trim();

        if (appUserRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException(
                    "Mobile number is already registered");
        }

        AppUser user = new AppUser(
                name.trim(),
                phone,
                passwordEncoder.encode(password),
                "FARMER"
        );

        return appUserRepository.save(user);
    }

    
public AppUser login(String phone, String password) {

    if (phone == null || !phone.trim().matches("[0-9]{10}")) {
        throw new IllegalArgumentException(
                "Enter a valid 10-digit mobile number");
    }

    if (password == null || password.isEmpty()) {
        throw new IllegalArgumentException(
                "Password is required");
    }

    AppUser user = appUserRepository
            .findByPhone(phone.trim())
            .orElseThrow(() -> new IllegalArgumentException(
                    "Invalid mobile number or password"));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new IllegalArgumentException(
                "Invalid mobile number or password");
    }

    return user;
}

}
