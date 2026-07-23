package br.com.foztalentos.api.entity;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.WorkMode;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "jobs")
public class Job {
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Admin createdBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String company;

    @NotBlank
    private String state;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ContractType contractType;

    @NotNull
    @Enumerated(EnumType.STRING)
    private WorkMode workMode;

    @NotBlank
    private String salary;

    @NotNull
    private Boolean active;

    @NotBlank
    private String description;

    @NotBlank
    private String requirements;

    @NotBlank
    private String benefits;

    @NotBlank
    private String phone;

    @Email
    @NotBlank
    private String email;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private LocalDateTime updatedAt;




}
