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

            predicates.add(criteriaBuilder.equal(root.get("active"), true));
            predicates.add(criteriaBuilder.isTrue(root.get("active")));

            if (filter.states() != null && !filter.states().isEmpty()) {

                predicates.add(root.get("state").in(filter.states()));

            }

            if (filter.categoryId() != null) {

                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), filter.categoryId()));

            }

            if (filter.contractType() != null) {

                predicates.add(criteriaBuilder.equal(root.get("contractType"), filter.contractType()));

            }

            if (filter.workMode() != null) {

                predicates.add(criteriaBuilder.equal(root.get("workMode"), filter.workMode()));

            }

            if (filter.search() != null && !filter.search().isBlank()) {

                String search = "%" + filter.search().toLowerCase() + "%";

                predicates.add(
                        criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")),search),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("company")),search),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),search),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("requirements")),search)));

            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

    }
}
