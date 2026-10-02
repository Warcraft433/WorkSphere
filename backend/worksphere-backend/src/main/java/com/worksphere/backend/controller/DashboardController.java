package com.worksphere.backend.controller;

import com.worksphere.backend.entity.LeaveRequest;
import com.worksphere.backend.repository.DepartmentRepository;
import com.worksphere.backend.repository.EmployeeRepository;
import com.worksphere.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @GetMapping("/stats")
    public DashboardStats getStats() {
        long employees = employeeRepository.count();
        long departments = departmentRepository.count();
        long pendingLeaves = leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING);
        
        return new DashboardStats(employees, departments, pendingLeaves);
    }

    public record DashboardStats(long totalEmployees, long totalDepartments, long pendingLeaves) {}
}
