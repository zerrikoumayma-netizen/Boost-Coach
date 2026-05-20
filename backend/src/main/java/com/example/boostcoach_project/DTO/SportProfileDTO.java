package com.example.boostcoach_project.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import com.example.boostcoach_project.model.SportProfile.Level
;

@Data
public class SportProfileDTO {

    @Min(value = 10, message = "L'âge minimum est 10 ans")
    @Max(value = 100, message = "L'âge maximum est 100 ans")
    private int age;

    private String city;

    private Set<String> objectives = new HashSet<>();

    private Level level;

    @Size(max = 120)
    private String hobby;

    @Min(value = 0, message = "Le budget doit etre positif")
    @Max(value = 100000, message = "Le budget maximum est 100000 MAD")
    private int budget;
}
