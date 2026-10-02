package com.worksphere.backend.service;

import com.opencsv.CSVWriter;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final EmployeeRepository employeeRepository;

    public byte[] generateEmployeeCsv() {
        List<Employee> employees = employeeRepository.findAll();
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(baos);
             CSVWriter csvWriter = new CSVWriter(writer)) {
            
            // Write Header
            String[] header = {"ID", "First Name", "Last Name", "Email", "Phone", "Hire Date", "Salary"};
            csvWriter.writeNext(header);
            
            // Write Data
            for (Employee emp : employees) {
                String[] row = {
                    String.valueOf(emp.getId()),
                    emp.getFirstName(),
                    emp.getLastName(),
                    emp.getEmail(),
                    emp.getPhone() != null ? emp.getPhone() : "",
                    emp.getHireDate() != null ? emp.getHireDate().toString() : "",
                    emp.getSalary() != null ? String.valueOf(emp.getSalary()) : "0"
                };
                csvWriter.writeNext(row);
            }
            
            csvWriter.flush();
            return baos.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }
}
