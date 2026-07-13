package br.com.foztalentos.api.repository;

import br.com.foztalentos.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
