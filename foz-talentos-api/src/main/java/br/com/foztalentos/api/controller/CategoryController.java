package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.category.CategoryRequestDTO;
import br.com.foztalentos.api.dto.category.CategoryResponseDTO;
import br.com.foztalentos.api.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

// Controller para gerenciamento de categorias de vagas
@RestController
@RequestMapping(ApiRoutes.CATEGORIES)
@RequiredArgsConstructor
@PreAuthorize("hasRole('MASTER')")
@Tag(name = "Categorias")
public class CategoryController {

    private final CategoryService categoryService;

    // Listagem paginada de categorias
    @Operation(summary = "Listar todas as categorias")
    @GetMapping
    public ResponseEntity<Page<CategoryResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {

        Page<CategoryResponseDTO> categories = categoryService.findAll(pageable);

        return ResponseEntity.ok(categories);

    }

    // Busca de categoria específica por ID
    @Operation(summary = "Buscar categoria por ID")
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> findById( @PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    // Cadastro de nova categoria
    @Operation(summary = "Cadastrar categoria")
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> create(@Valid @RequestBody CategoryRequestDTO request) {

        CategoryResponseDTO savedCategory = categoryService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }

    // Edição de categoria existente
    @Operation(summary = "Atualizar categoria")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO request) {

        CategoryResponseDTO updatedCategory = categoryService.update(id, request);

        return ResponseEntity.ok(updatedCategory);
    }

    // Inativação de categoria
    @Operation(summary = "Desativar categoria")
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        categoryService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    // Ativação de categoria
    @Operation(summary = "Reativar categoria")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id){
        categoryService.activate(id);
        return ResponseEntity.noContent().build();
    }

}
