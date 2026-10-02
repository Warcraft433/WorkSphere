package com.worksphere.backend.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Designation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}
