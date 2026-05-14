package com.example.decathlon_project.service;


import com.example.decathlon_project.DTO.RegisterRequest;
import com.example.decathlon_project.DTO.SportProfileDTO;
import com.example.decathlon_project.exception.ConflictException;
import com.example.decathlon_project.exception.ResourceNotFoundException;
import com.example.decathlon_project.model.Role;
import com.example.decathlon_project.model.SportProfile;
import com.example.decathlon_project.model.User;
import com.example.decathlon_project.repository.SportProfileRepository;
import com.example.decathlon_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SportProfileRepository sportProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Ce nom d'utilisateur est déjà pris.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Cet email est déjà utilisé.");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(Role.ROLE_USER))
                .loyaltyPoints(0)
                .build();
        User savedUser = userRepository.save(user);

        SportProfile profile = SportProfile.builder()
                .age(request.getAge())
                .city(request.getCity())
                .hobby(request.getHobby())
                .budget(request.getBudget())
                .level(request.getLevel())
                .objectives(Set.of(request.getObjective()))
                .user(savedUser)
                .build();
        sportProfileRepository.save(profile);
        savedUser.setSportProfile(profile);

        return savedUser;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur introuvable : " + username));
    }

    @Transactional
    public SportProfile saveOrUpdateProfile(String username, SportProfileDTO dto) {
        User user = getUserByUsername(username);

        SportProfile profile = sportProfileRepository.findByUserId(user.getId())
                .orElse(SportProfile.builder().user(user).build());

        profile.setAge(dto.getAge());
        profile.setCity(dto.getCity());
        profile.setHobby(dto.getHobby());
        profile.setBudget(dto.getBudget());
        profile.setObjectives(dto.getObjectives());
        profile.setLevel(dto.getLevel());

        return sportProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public SportProfile getProfile(String username) {
        User user = getUserByUsername(username);
        return sportProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Profil sportif introuvable pour : " + username));
    }

    @Transactional
    public void addLoyaltyPoints(Long userId, int points) {
        User user = getUserById(userId);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        userRepository.save(user);
    }
}
