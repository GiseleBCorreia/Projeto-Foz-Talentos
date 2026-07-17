package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.category.CategoryRequestDTO;
import br.com.foztalentos.api.dto.category.CategoryResponseDTO;
import br.com.foztalentos.api.entity.Category;
import br.com.foztalentos.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;


    public CategoryResponseDTO create(CategoryRequestDTO request) {

        Category category = new Category();

        category.setActive(true);
        category.setCreatedAt(LocalDateTime.now());

        Category savedCategory = categoryRepository.save(category);

        return toResponseDTO(savedCategory);

    }

    public List<CategoryResponseDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public CategoryResponseDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        return toResponseDTO(category);
    }

    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        category.setName(request.name());

        Category updatedCategory = categoryRepository.save(category);

        return toResponseDTO(updatedCategory);
    }

    public void deactivate(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found."));

        category.setActive(false);

        categoryRepository.save(category);
    }
    private CategoryResponseDTO toResponseDTO(Category category) {

        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getActive(),
                category.getCreatedAt()
        );
    }
    

}
