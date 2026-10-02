package com.worksphere.backend.repository;
import com.worksphere.backend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    long countByStatus(LeaveRequest.Status status);
}
