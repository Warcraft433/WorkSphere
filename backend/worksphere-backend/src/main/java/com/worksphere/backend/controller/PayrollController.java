package com.worksphere.backend.controller;
import com.worksphere.backend.entity.Payroll;
import com.worksphere.backend.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payrolls")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PayrollController {
    private final PayrollService service;

    @GetMapping
    public List<Payroll> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Payroll getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Payroll create(@RequestBody Payroll entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public Payroll update(@PathVariable Long id, @RequestBody Payroll entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
