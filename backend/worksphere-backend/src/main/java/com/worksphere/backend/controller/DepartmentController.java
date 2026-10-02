package com.worksphere.backend.controller;
import com.worksphere.backend.entity.Department;
import com.worksphere.backend.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DepartmentController {
    private final DepartmentService service;

    @GetMapping
    public List<Department> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Department getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Department create(@RequestBody Department entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public Department update(@PathVariable Long id, @RequestBody Department entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
