package com.worksphere.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Boolean status = true;

    // Forces password reset on first login
    private Boolean mustChangePassword = false;

    // Optional: comma-separated allowed modules for SUB_ADMIN, e.g. "Dashboard,Employees,Attendance"
    @Column(length = 500)
    private String allowedModules;

    public enum Role {
        ADMIN, SUB_ADMIN, HR, EMPLOYEE
    }
}
