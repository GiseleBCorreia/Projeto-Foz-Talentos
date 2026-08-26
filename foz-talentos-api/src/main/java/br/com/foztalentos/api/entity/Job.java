package br.com.foztalentos.api.entity;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Entidade que representa a tabela "jobs" (vagas de emprego)
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
    private JobLevel level;

    @NotNull
    @Enumerated(EnumType.STRING)
    private WorkMode workMode;

    @NotBlank
    private String salary;

    @Column(nullable = true)
    private BigDecimal salaryValue;

    @NotNull
    private Boolean active = true;

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

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
