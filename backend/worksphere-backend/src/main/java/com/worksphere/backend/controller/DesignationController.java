package com.worksphere.backend.controller;
import com.worksphere.backend.entity.Designation;
import com.worksphere.backend.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DesignationController {
    private final DesignationService service;

    @GetMapping
    public List<Designation> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Designation getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Designation create(@RequestBody Designation entity) { return service.save(entity); }

    @PutMapping("/{id}")
    public Designation update(@PathVariable Long id, @RequestBody Designation entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.deleteById(id); }
}
