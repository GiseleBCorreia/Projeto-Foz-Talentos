package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.category.CategoryRequestDTO;
import br.com.foztalentos.api.dto.category.CategoryResponseDTO;
import br.com.foztalentos.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponseDTO create(CategoryRequestDTO request) {
        return null;
    }

    public List<CategoryResponseDTO> findAll() {
        return null;
    }

    public CategoryResponseDTO findById(Long id) {
        return null;
    }

    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {
        return null;
    }

    public void deactivate(Long id) {

    }

}
