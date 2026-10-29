
package com.dairyflow.dairyflow.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.dairyflow.dairyflow.config.JwtService;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AppUserController {

   
private final AppUserService appUserService;
private final JwtService jwtService;

public AppUserController(
        AppUserService appUserService,
        JwtService jwtService) {
    this.appUserService = appUserService;
    this.jwtService = jwtService;
}


    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Map<String, String> request) {
        try {
            AppUser user = appUserService.registerFarmer(
                    request.get("name"),
                    request.get("phone"),
                    request.get("password")
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "id", user.getId(),
                    "name", user.getName(),
                    "phone", user.getPhone(),
                    "role", user.getRole()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {
        try {
            AppUser user = appUserService.login(
                    request.get("phone"),
                    request.get("password")
            );

            String token = jwtService.generateToken(
                    user.getPhone(),
                    user.getRole()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "id", user.getId(),
                    "name", user.getName(),
                    "phone", user.getPhone(),
                    "role", user.getRole()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

}
