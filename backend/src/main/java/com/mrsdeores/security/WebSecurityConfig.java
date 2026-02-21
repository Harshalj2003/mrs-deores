package com.mrsdeores.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.mrsdeores.security.jwt.AuthEntryPointJwt;
import com.mrsdeores.security.jwt.AuthTokenFilter;
import com.mrsdeores.security.services.UserDetailsServiceImpl;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("CRITICAL: Initializing Security Filter Chain (WebSecurityConfig) - Lambda DSL");

        http
                .cors(Customizer.withDefaults()) // Uses the corsConfigurationSource bean defined below
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Allow Spring Boot Error dispatching
                        .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll()
                        .requestMatchers("/error").permitAll()

                        // Allow static resources & uploads first (most specific)
                        .requestMatchers("/uploads/**").permitAll()

                        // Allow Options requests for CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public API Endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/search").permitAll()

                        // Admin Restrictions
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other requests need authentication
                        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow origins from configuration
        configuration.setAllowedOriginPatterns(allowedOrigins);
        // Allow all methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Allow specific headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token"));
        // Expost headers if needed
        configuration.setExposedHeaders(List.of("x-auth-token"));
        // Allow credentials
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
