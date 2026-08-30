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
    
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Admin createdBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 160)
    private String company;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String state;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractType contractType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JobLevel level;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkMode workMode;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String salary;

    @Column(nullable = true, precision = 12, scale = 2)
    private BigDecimal salaryValue;

    @NotNull
    private Boolean active = true;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String requirements;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String benefits;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String phone;

    @Email
    @NotBlank
    @Column(nullable = false, length = 254)
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
