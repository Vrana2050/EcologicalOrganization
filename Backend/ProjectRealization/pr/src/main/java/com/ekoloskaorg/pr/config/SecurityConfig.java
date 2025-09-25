package com.ekoloskaorg.pr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST/POST iz Postman-a bez CSRF tokena
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll() // pusti sve tvoje API-je
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}
