package HerramientasDesarrollo.demo;

import HerramientasDesarrollo.demo.entity.Doctor;
import HerramientasDesarrollo.demo.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(DoctorRepository doctorRepository) {
        return args -> {
            if (doctorRepository.count() == 0) {
                Doctor d1 = new Doctor();
                d1.setNombre("Carlos");
                d1.setApellido("Rodriguez");
                d1.setExperienciaAnios(15);
                d1.setConsultorio("301");
                d1.setClinicaId(1L);
                doctorRepository.save(d1);

                Doctor d2 = new Doctor();
                d2.setNombre("Ana");
                d2.setApellido("Martinez");
                d2.setExperienciaAnios(12);
                d2.setConsultorio("205");
                d2.setClinicaId(1L);
                doctorRepository.save(d2);

                Doctor d3 = new Doctor();
                d3.setNombre("Luis");
                d3.setApellido("Fernandez");
                d3.setExperienciaAnios(20);
                d3.setConsultorio("402");
                d3.setClinicaId(1L);
                doctorRepository.save(d3);
            }
        };
    }
}