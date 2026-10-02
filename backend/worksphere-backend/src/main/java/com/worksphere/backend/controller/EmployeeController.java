package com.worksphere.backend.controller;
import com.worksphere.backend.entity.Employee;
import com.worksphere.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {
    private final EmployeeService service;

    @GetMapping
    public Page<Employee> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) { 
        return service.findAll(PageRequest.of(page, size)); 
    }

    @GetMapping("/{id}")
    public Employee getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Employee create(@RequestBody Employee entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public Employee update(@PathVariable Long id, @RequestBody Employee entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
