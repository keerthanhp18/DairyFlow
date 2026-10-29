
package com.dairyflow.dairyflow.config;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String SECRET =
            "ZGFpcnlmbG93LXNlY3JldC1rZXktZm9yLWRldmVsb3BtZW50LTIwMjY=";

    private final SecretKey secretKey = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode(SECRET)
    );

    public String generateToken(String phone, String role) {
        long expirationTime = 1000L * 60 * 60 * 8;

        return Jwts.builder()
                .subject(phone)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()
                        + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
