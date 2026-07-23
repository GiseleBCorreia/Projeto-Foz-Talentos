package br.com.foztalentos.api.repository;

import br.com.foztalentos.api.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByActiveTrue();
    List<Job> findByCategoryId(Long id);
    List<Job> findByState(String state);
    List<Job> findByTitleContainingIgnoreCase(String title);


}
