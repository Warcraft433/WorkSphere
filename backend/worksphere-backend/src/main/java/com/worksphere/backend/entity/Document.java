package com.worksphere.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @Column(length = 50)
    private String docType;
    
    @Column(length = 255)
    private String filePath;
    
    private LocalDateTime uploadedOn;
    
    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
