package com.tpd.XCity.service.impl;

import com.tpd.XCity.dto.common.TokenDTO;
import com.tpd.XCity.dto.common.UserAuthDTO;
import com.tpd.XCity.dto.request.LoginRequest;
import com.tpd.XCity.dto.request.RegisterRequest;
import com.tpd.XCity.entity.User;
import com.tpd.XCity.exception.BadRequestException;
import com.tpd.XCity.repository.UserRepository;
import com.tpd.XCity.service.AuthService;
import com.tpd.XCity.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserAuthDTO login(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        if (usernameOrEmail == null || password == null)
            throw new BadCredentialsException("Wrong username or password");

        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(usernameOrEmail, password));

        UserDetails userDetail = (UserDetails) authentication.getPrincipal();

        User user = userRepository.findByUsername(userDetail.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Username doesn't exist"));

        TokenDTO tokenDTO = jwtService.generateToken(userDetail.getUsername(), user.getId());

        return UserAuthDTO.builder()
                .user(user)
                .tokenDTO(tokenDTO)
                .build();
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityUtils.getAuthentication();
        return userRepository.findByUsername(((UserDetails) authentication.getPrincipal()).getUsername())
                .orElseThrow(() -> new BadRequestException("User doesn't exist"));
    }

    @Override
    public void register(RegisterRequest loginRequest) {
        User user = User.builder()
                .username(loginRequest.getUsername())
                .password(passwordEncoder.encode(loginRequest.getPassword()))
                .build();
        userRepository.save(user);
    }
}












































