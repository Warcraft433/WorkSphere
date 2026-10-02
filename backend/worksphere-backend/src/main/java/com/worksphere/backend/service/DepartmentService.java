package com.worksphere.backend.service;
import com.worksphere.backend.entity.Department;
import com.worksphere.backend.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentRepository repository;

    public List<Department> findAll() { return repository.findAll(); }
    public Department findById(Long id) { return repository.findById(id).orElse(null); }
    public Department save(Department entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
