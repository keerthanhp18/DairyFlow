package com.dairyflow.dairyflow.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AccountSeeder {

    @Bean
    CommandLineRunner createStaffAccounts(
            AppUserRepository repository,
            PasswordEncoder passwordEncoder) {

        return args -> {
            if (!repository.existsByPhone("6362141634")) {
                repository.save(new AppUser(
                        "Dairy Operator",
                        "6362141634",
                        passwordEncoder.encode("Operator@123"),
                        "OPERATOR"
                ));
                System.out.println("Operator account created.");
            }

            if (!repository.existsByPhone("8722236740")) {
                repository.save(new AppUser(
                        "Dairy Secretary",
                        "8722236740",
                        passwordEncoder.encode("Secretary@123"),
                        "SECRETARY"
                ));
                System.out.println("Secretary account created.");
            }
        };
    }
}