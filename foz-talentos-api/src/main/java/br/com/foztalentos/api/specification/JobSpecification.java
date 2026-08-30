package br.com.foztalentos.api.specification;

import br.com.foztalentos.api.dto.job.JobFilterDTO;
import br.com.foztalentos.api.entity.Job;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> filter(JobFilterDTO filter) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (filter.getStates() != null && !filter.getStates().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("state"), filter.getStates()));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), filter.getCategoryId()));

            }

            if (filter.getContractType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("contractType"), filter.getContractType()));

            }

            if (filter.getLevel() != null) {
                predicates.add(criteriaBuilder.equal(root.get("level"), filter.getLevel()));
            }

            if (filter.getWorkMode() != null) {
                predicates.add(criteriaBuilder.equal(root.get("workMode"), filter.getWorkMode()));

            }

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {

                String search = "%" + filter.getSearch().toLowerCase() + "%";

                predicates.add(
                        criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")),search),
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("company")),search),
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),search),
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("requirements")),search)));

            }

            if (filter.getMinSalary() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("salaryValue"), filter.getMinSalary()));
            }

            if (filter.getMaxSalary() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("salaryValue"), filter.getMaxSalary()));
            }

            if (filter.getPublishedAfter() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filter.getPublishedAfter().atStartOfDay()));
            }

            if (filter.getPublishedBefore() != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), filter.getPublishedBefore().plusDays(1).atStartOfDay()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

    }
}