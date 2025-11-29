package com.tpd.XCity.dto.common;


import com.tpd.XCity.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
public class UserAuthDTO {
    private User user;
    private TokenDTO tokenDTO;
}