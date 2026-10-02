package com.worksphere.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String actionType; // e.g. EMPLOYEE_CREATED, CLOCK_IN, etc.

    @Column(nullable = false, length = 255)
    private String description;

    @Column(length = 100)
    private String actorUsername;

    private Long affectedEntityId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
