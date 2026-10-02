package com.worksphere.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    private LocalDate workDate;
    private LocalTime checkIn;
    private LocalTime checkOut;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    public enum Status {
        PRESENT, ABSENT, HALF_DAY
    }
}
