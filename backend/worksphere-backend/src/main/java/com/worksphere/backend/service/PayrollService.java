package com.worksphere.backend.service;

import com.worksphere.backend.entity.Payroll;
import com.worksphere.backend.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {
    
    private final PayrollRepository repository;

    public List<Payroll> findAll() { return repository.findAll(); }
    public Payroll findById(Long id) { return repository.findById(id).orElse(null); }
    
    public Payroll generatePayroll(Payroll payroll) {
        if (payroll.getBasicSalary() == null) payroll.setBasicSalary(0.0);
        if (payroll.getAllowances() == null) payroll.setAllowances(0.0);
        
        // Base deductions calculation (e.g., 10% flat tax + custom deductions)
        double tax = payroll.getBasicSalary() * 0.10;
        double customDeductions = payroll.getDeductions() != null ? payroll.getDeductions() : 0.0;
        double totalDeductions = tax + customDeductions;
        
        double netSalary = payroll.getBasicSalary() + payroll.getAllowances() - totalDeductions;
        
        payroll.setDeductions(totalDeductions);
        payroll.setNetSalary(netSalary);
        payroll.setCreatedOn(LocalDateTime.now());
        
        return repository.save(payroll);
    }
    
    public Payroll save(Payroll entity) { return generatePayroll(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
