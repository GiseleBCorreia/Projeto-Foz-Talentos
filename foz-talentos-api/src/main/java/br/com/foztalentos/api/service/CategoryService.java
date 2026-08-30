package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.category.CategoryRequestDTO;
import br.com.foztalentos.api.dto.category.CategoryResponseDTO;
import br.com.foztalentos.api.entity.Category;
import br.com.foztalentos.api.exception.BusinessException;
import br.com.foztalentos.api.exception.ResourceNotFoundException;
import br.com.foztalentos.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

// Serviço de regras de negócio para gerenciamento de categorias de vagas
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Cria uma nova categoria impedindo nomes duplicados
    public CategoryResponseDTO create(CategoryRequestDTO request) {

        Category category = new Category();

        String normalizedName = normalizeName(request.name());
        category.setActive(true);
        category.setName(normalizedName);

        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new BusinessException("Category already exists");
        }


        Category savedCategory = categoryRepository.save(category);

        return toResponseDTO(savedCategory);

    }

    // Retorna categorias paginadas
    public Page<CategoryResponseDTO> findAll(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::toResponseDTO);
    }

    // Busca categoria por ID ou lança exceção caso não exista
    public CategoryResponseDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        return toResponseDTO(category);
    }

    // Atualiza nome da categoria verificando duplicidade com outros registros
    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        String normalizedName = normalizeName(request.name());
        Category existing = categoryRepository
                .findByNameIgnoreCase(normalizedName)
                .orElse(null);

        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException("Category already exists.");
        }

        category.setName(normalizeName(request.name()));

        Category updatedCategory = categoryRepository.save(category);

        return toResponseDTO(updatedCategory);
    }

    // Desativa a categoria (soft delete)
    public void deactivate(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Category not found."));

        category.setActive(false);

        categoryRepository.save(category);
    }

    public void activate(Long id){

        Category category = categoryRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Category not found."));

        category.setActive(true);

        categoryRepository.save(category);
    }

    private String normalizeName(String name) {
        return name.trim().replaceAll("\\s+", " ");
    }

    // Converte a entidade Category para DTO de resposta
    private CategoryResponseDTO toResponseDTO(Category category) {

        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
    

}
