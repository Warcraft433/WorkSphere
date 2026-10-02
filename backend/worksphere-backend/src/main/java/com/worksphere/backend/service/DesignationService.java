package com.worksphere.backend.service;
import com.worksphere.backend.entity.Designation;
import com.worksphere.backend.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationService {
    private final DesignationRepository repository;

    public List<Designation> findAll() { return repository.findAll(); }
    public Designation findById(Long id) { return repository.findById(id).orElse(null); }
    public Designation save(Designation entity) { return repository.save(entity); }
    public void deleteById(Long id) { repository.deleteById(id); }
}
