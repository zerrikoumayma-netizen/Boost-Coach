package com.example.boostcoach_project.DTO;

import com.example.boostcoach_project.model.Role;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private Set<Role> roles;
    private int loyaltyPoints;
}
