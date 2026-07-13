package br.com.foztalentos.api.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private Boolean active = true;

    @NotNull
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "category")
    private List<Job> jobs = new ArrayList<>();

}
