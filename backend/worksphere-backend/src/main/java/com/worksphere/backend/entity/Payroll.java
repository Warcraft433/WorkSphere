package com.worksphere.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @Column(name = "pay_month", length = 7)
    private String month;
    
    private Double basicSalary;
    
    private Double allowances;
    
    private Double deductions;
    
    private Double netSalary;
    
    private LocalDateTime createdOn;
}
