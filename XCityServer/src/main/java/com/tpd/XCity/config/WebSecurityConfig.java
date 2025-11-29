package com.tpd.XCity.config;

import com.tpd.XCity.filter.CORSFilter;
import com.tpd.XCity.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.channel.ChannelProcessingFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CORSFilter CORSFilter;
    private final AuthenticationProvider authenticationProvider;
    private final AuthenticationEntryPoint customeAuthenticationEntryPoint;
    private final AccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(session
                        -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login",
                                "/api/v1/air/notify",
                                "/api/v1/alert",
                                "/api/v1/traffic/notify",
                                "/api/v1/traffic/download-statics/",
                                "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/air/monthly-statics",
                                "/api/v1/air/daily-statics",
                                "/api/v1/alerts",
                                "/api/v1/alert/solved",
                                "/api/v1/alert/statics",
                                "/api/v1/alert/download",
                                "/api/v1/alert-notification",
                                "/api/v1/buildings",
                                "/api/v1/building/{id}",
                                "/api/v1/s-buildings",
                                "/api/v1/camera/{id}",
                                "/api/v1/all-camera",
                                "/api/v1/cameras",
                                "/api/v1/device/{id}",
                                "/api/v1/devices-map",
                                "/api/v1/devices",
                                "/api/v1/traffic/daily-statics/{cameraId}",
                                "/api/v1/auth/register",
                                "/api/v1/ws/**").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(CORSFilter, ChannelProcessingFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> {
                    exception.authenticationEntryPoint(customeAuthenticationEntryPoint);
                    exception.accessDeniedHandler(customAccessDeniedHandler);
                });

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration auth) throws Exception {
        return auth.getAuthenticationManager();
    }
}
