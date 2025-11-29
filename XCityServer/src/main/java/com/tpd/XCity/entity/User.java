package com.tpd.XCity.entity;

import com.tpd.XCity.entity.enumeration.Role;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "user")
@Data
@Builder
public class User {
    @Id
    private String id;

    @Field("username")
    private String username;

    @Field("password")
    private String password;

    @Field("role")
    private Role role;
}
