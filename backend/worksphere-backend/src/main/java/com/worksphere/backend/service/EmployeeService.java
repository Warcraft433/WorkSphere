package com.worksphere.backend.service;

import com.worksphere.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public String getEmployee() {
        return employeeRepository.getEmployee();
    }
}