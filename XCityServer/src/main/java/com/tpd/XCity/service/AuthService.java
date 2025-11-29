package com.tpd.XCity.service;

import com.tpd.XCity.dto.common.UserAuthDTO;
import com.tpd.XCity.dto.request.LoginRequest;
import com.tpd.XCity.dto.request.RegisterRequest;
import com.tpd.XCity.entity.User;

public interface AuthService {
    UserAuthDTO login(LoginRequest loginRequest);
    void register(RegisterRequest loginRequest);
    User getCurrentUser();
}