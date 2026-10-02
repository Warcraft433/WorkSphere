package com.worksphere.backend.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;
    
    @Column(length = 50)
    private String leaveType;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Column(length = 255)
    private String reason;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    private LocalDateTime appliedOn;
    
    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}
