package br.com.foztalentos.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FozTalentosApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(FozTalentosApiApplication.class, args);
	}

}
