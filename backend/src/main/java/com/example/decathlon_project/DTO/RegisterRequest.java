package com.example.decathlon_project.DTO;

import com.example.decathlon_project.model.SportProfile.Level;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "L'objectif sportif est obligatoire")
    @Size(max = 120)
    private String objective;

    @NotBlank(message = "Le loisir est obligatoire")
    @Size(max = 120)
    private String hobby;

    @NotBlank(message = "La ville est obligatoire")
    @Size(max = 100)
    private String city;

    @NotNull(message = "L'age est obligatoire")
    @Min(value = 10, message = "L'age minimum est 10 ans")
    @Max(value = 100, message = "L'age maximum est 100 ans")
    private Integer age;

    @NotNull(message = "Le niveau sportif est obligatoire")
    private Level level;

    @NotNull(message = "Le budget est obligatoire")
    @Min(value = 0, message = "Le budget doit etre positif")
    @Max(value = 100000, message = "Le budget maximum est 100000 MAD")
    private Integer budget;
}
