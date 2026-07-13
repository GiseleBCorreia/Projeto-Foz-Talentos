package br.com.foztalentos.api.repository;

import br.com.foztalentos.api.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {

}
